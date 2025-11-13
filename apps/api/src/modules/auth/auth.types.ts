import type { Role } from '@prisma/client';
import type { RegisterCompanyInput as GeneratedRegisterCompanyInput } from '../../generated';

/**
 * Registration input data (for registering in existing clinic)
 */
export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  clinicId: string;
}

/**
 * Register company input data (creates clinic + user)
 * Note: clinicName is added by the form but not part of GraphQL input
 */
export type RegisterCompanyInput = GeneratedRegisterCompanyInput & { clinicName: string };

/**
 * Login input data
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  clinicId: string;
  tokenVersion?: number;
}

/**
 * Token pair returned on login/register
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Clinic info in login response
 */
export interface LoginClinicInfo {
  id: string;
  name: string;
}

/**
 * Login response with user and clinics list
 */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: Role;
    clinicId: string;
  };
  clinics: LoginClinicInfo[];
}

/**
 * Auth response with user data and tokens
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: Role;
    clinicId: string;
  };
  tokens: AuthTokens;
}

/**
 * Refresh token data stored in Redis
 */
export interface RefreshTokenData {
  userId: string;
  email: string;
  role: Role;
  clinicId: string;
  tokenVersion: number;
  createdAt: string;
  expiresAt: string;
}

/**
 * Token configuration
 */
export interface TokenConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}
