import type { PrismaClient, User, Role } from '@prisma/client';
import type Redis from 'ioredis';
import type { RefreshTokenData } from './auth.types';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  clinicId: string;
}

/**
 * Auth Repository Layer
 * Handles database and Redis operations for authentication
 */
export function createAuthRepository(prisma: PrismaClient, redis: Redis) {
  return {
    /**
     * Find user by email (returns first user, for backward compatibility)
     */
    async findUserByEmail(email: string): Promise<User | null> {
      return prisma.user.findFirst({
        where: { email },
      });
    },

    /**
     * Find all users with the same email
     * Supports multi-clinic logins
     */
    async findAllUsersByEmail(email: string) {
      return prisma.user.findMany({
        where: { email },
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    },

    /**
     * Find user by ID
     */
    async findUserById(id: string): Promise<User | null> {
      return prisma.user.findUnique({
        where: { id },
      });
    },

    /**
     * Create a new user
     */
    async createUser(data: CreateUserData): Promise<User> {
      return prisma.user.create({
        data,
      });
    },

    /**
     * Store refresh token in Redis
     * Key format: refresh_token:{token}
     */
    async storeRefreshToken(
      token: string,
      data: RefreshTokenData,
      expirySeconds: number
    ): Promise<void> {
      const key = `refresh_token:${token}`;
      await redis.setex(key, expirySeconds, JSON.stringify(data));
    },

    /**
     * Get refresh token data from Redis
     */
    async getRefreshToken(token: string): Promise<RefreshTokenData | null> {
      const key = `refresh_token:${token}`;
      const data = await redis.get(key);

      if (!data) {
        return null;
      }

      try {
        return JSON.parse(data) as RefreshTokenData;
      } catch {
        return null;
      }
    },

    /**
     * Delete refresh token from Redis
     */
    async deleteRefreshToken(token: string): Promise<void> {
      const key = `refresh_token:${token}`;
      await redis.del(key);
    },

    /**
     * Delete all refresh tokens for a user
     * Used for logout from all devices
     */
    async deleteAllUserRefreshTokens(userId: string): Promise<void> {
      const pattern = `refresh_token:*`;
      const keys = await redis.keys(pattern);

      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          try {
            const tokenData = JSON.parse(data) as RefreshTokenData;
            if (tokenData.userId === userId) {
              await redis.del(key);
            }
          } catch {
            // Skip invalid tokens
          }
        }
      }
    },

    /**
     * Check if email already exists (globally)
     */
    async emailExists(email: string): Promise<boolean> {
      const count = await prisma.user.count({
        where: { email },
      });
      return count > 0;
    },

    /**
     * Check if email already exists in a specific clinic
     */
    async emailExistsInClinic(email: string, clinicId: string): Promise<boolean> {
      const count = await prisma.user.count({
        where: { email, clinicId },
      });
      return count > 0;
    },

    /**
     * Update user's email verification status
     */
    async verifyEmail(userId: string): Promise<User> {
      return prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    },

    /**
     * Update user's password
     */
    async updatePassword(userId: string, passwordHash: string): Promise<User> {
      return prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
