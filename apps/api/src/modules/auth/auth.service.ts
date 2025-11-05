import { GraphQLError } from 'graphql';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { AuthRepository } from './auth.repository';
import type {
  RegisterInput,
  LoginInput,
  AuthResponse,
  JWTPayload,
  AuthTokens,
  RefreshTokenData,
  TokenConfig,
} from './auth.types';
import type { Context } from '../../common/types/context';
import { getPermissionsForRole } from '../../common/auth/permissions';

/**
 * Auth Service Layer
 * Contains authentication business logic, JWT generation, and token management
 */
export function createAuthService(repository: AuthRepository) {
  // Token configuration from environment variables
  const tokenConfig: TokenConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  };

  // Convert expiry string to seconds
  const getExpirySeconds = (expiry: string): number => {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // default 1 day
    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
  };

  const refreshTokenExpirySeconds = getExpirySeconds(tokenConfig.refreshTokenExpiry);

  return {
    /**
     * Hash password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
      const saltRounds = 10;
      return bcrypt.hash(password, saltRounds);
    },

    /**
     * Compare password with hash
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
      return bcrypt.compare(password, hash);
    },

    /**
     * Generate access token (short-lived)
     */
    generateAccessToken(payload: JWTPayload): string {
      return jwt.sign(
        payload as object,
        tokenConfig.accessTokenSecret,
        { expiresIn: tokenConfig.accessTokenExpiry } as jwt.SignOptions
      );
    },

    /**
     * Generate refresh token (long-lived)
     */
    generateRefreshToken(payload: JWTPayload): string {
      return jwt.sign(
        payload as object,
        tokenConfig.refreshTokenSecret,
        { expiresIn: tokenConfig.refreshTokenExpiry } as jwt.SignOptions
      );
    },

    /**
     * Verify access token
     */
    verifyAccessToken(token: string): JWTPayload | null {
      try {
        return jwt.verify(token, tokenConfig.accessTokenSecret) as JWTPayload;
      } catch {
        return null;
      }
    },

    /**
     * Verify refresh token
     */
    verifyRefreshToken(token: string): JWTPayload | null {
      try {
        return jwt.verify(token, tokenConfig.refreshTokenSecret) as JWTPayload;
      } catch {
        return null;
      }
    },

    /**
     * Generate token pair (access + refresh)
     */
    async generateTokenPair(userId: string, email: string, role: string, clinicId: string): Promise<AuthTokens> {
      const tokenVersion = Date.now();

      const payload: JWTPayload = {
        userId,
        email,
        role: role as any,
        clinicId,
        tokenVersion,
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      // Store refresh token in Redis
      const refreshTokenData: RefreshTokenData = {
        userId,
        email,
        role: role as any,
        clinicId,
        tokenVersion,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + refreshTokenExpirySeconds * 1000).toISOString(),
      };

      await repository.storeRefreshToken(refreshToken, refreshTokenData, refreshTokenExpirySeconds);

      return {
        accessToken,
        refreshToken,
      };
    },

    /**
     * Register a new user
     */
    async register(input: RegisterInput, ctx?: Context): Promise<AuthResponse> {
      // Validate input
      if (!input.email || !input.password) {
        throw new GraphQLError('Email and password are required', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (input.password.length < 8) {
        throw new GraphQLError('Password must be at least 8 characters long', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Check if email already exists
      const existingUser = await repository.findUserByEmail(input.email);
      if (existingUser) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Hash password
      const passwordHash = await this.hashPassword(input.password);

      // Create user
      const user = await repository.createUser({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role,
        clinicId: input.clinicId,
      });

      // Generate tokens
      const tokens = await this.generateTokenPair(user.id, user.email, user.role, user.clinicId);

      // Audit log
      await ctx?.audit?.log({
        clinicId: input.clinicId,
        actorId: user.id,
        action: 'auth.register',
        entity: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          clinicId: user.clinicId,
        },
        tokens,
      };
    },

    /**
     * Login user
     */
    async login(input: LoginInput, ctx?: Context): Promise<AuthResponse> {
      // Validate input
      if (!input.email || !input.password) {
        throw new GraphQLError('Email and password are required', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Find user by email
      const user = await repository.findUserByEmail(input.email);
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user is active
      if (!user.active) {
        throw new GraphQLError('Account is deactivated', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Generate tokens
      const tokens = await this.generateTokenPair(user.id, user.email, user.role, user.clinicId);

      // Audit log
      await ctx?.audit?.log({
        clinicId: user.clinicId,
        actorId: user.id,
        action: 'auth.login',
        entity: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          clinicId: user.clinicId,
        },
        tokens,
      };
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string, ctx?: Context): Promise<AuthTokens> {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new GraphQLError('Invalid or expired refresh token', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if refresh token exists in Redis
      const tokenData = await repository.getRefreshToken(refreshToken);
      if (!tokenData) {
        throw new GraphQLError('Refresh token not found or expired', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify token version matches
      if (tokenData.tokenVersion !== payload.tokenVersion) {
        throw new GraphQLError('Token version mismatch', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Get user from database to ensure they still exist and are active
      const user = await repository.findUserById(tokenData.userId);
      if (!user || !user.active) {
        throw new GraphQLError('User not found or inactive', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Delete old refresh token
      await repository.deleteRefreshToken(refreshToken);

      // Audit log
      await ctx?.audit?.log({
        clinicId: user.clinicId,
        actorId: user.id,
        action: 'auth.refreshToken',
        entity: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
        },
      });

      // Generate new token pair
      return this.generateTokenPair(user.id, user.email, user.role, user.clinicId);
    },

    /**
     * Logout user (invalidate refresh token)
     */
    async logout(refreshToken: string, ctx?: Context): Promise<boolean> {
      try {
        await repository.deleteRefreshToken(refreshToken);

        // Audit log (only if user is authenticated)
        if (ctx?.user && ctx.clinicId) {
          const user = await repository.findUserById(ctx.user.id);
          if (user) {
            await ctx.audit?.log({
              clinicId: ctx.clinicId,
              actorId: ctx.user.id,
              action: 'auth.logout',
              entity: 'User',
              entityId: ctx.user.id,
              metadata: {
                email: user.email,
              },
            });
          }
        }

        return true;
      } catch {
        return false;
      }
    },

    /**
     * Logout from all devices (invalidate all refresh tokens)
     */
    async logoutAll(userId: string, ctx?: Context): Promise<boolean> {
      try {
        await repository.deleteAllUserRefreshTokens(userId);

        // Audit log
        const user = await repository.findUserById(userId);
        if (user) {
          await ctx?.audit?.log({
            clinicId: user.clinicId,
            actorId: user.id,
            action: 'auth.logoutAll',
            entity: 'User',
            entityId: user.id,
            metadata: {
              email: user.email,
            },
          });
        }

        return true;
      } catch {
        return false;
      }
    },

    /**
     * Get authenticated user from access token
     */
    async getUserFromToken(token: string) {
      const payload = this.verifyAccessToken(token);
      if (!payload) {
        return null;
      }

      const user = await repository.findUserById(payload.userId);
      if (!user || !user.active) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        permissions: getPermissionsForRole(user.role),
      };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
