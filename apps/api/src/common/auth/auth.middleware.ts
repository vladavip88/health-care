import type { AuthUser } from '../types/context';
import { getPermissionsForRole } from './permissions';

/**
 * Mock authentication middleware
 * In production, this would verify JWT tokens and fetch user data
 */
export async function authenticateUser(
  authHeader?: string
): Promise<AuthUser | null> {
  if (!authHeader) {
    return null;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  // TODO: Replace with actual JWT verification
  // For now, this is a mock implementation
  try {
    // In production, you would:
    // 1. Verify the JWT signature
    // 2. Check expiration
    // 3. Fetch user from database
    // 4. Return user with permissions

    // Mock user for development (REMOVE IN PRODUCTION)
    if (token === 'dev-admin-token') {
      const role = 'CLINIC_ADMIN';
      return {
        id: 'dev-user-1',
        email: 'admin@clinic.com',
        role,
        clinicId: 'clinic-1',
        permissions: getPermissionsForRole(role),
      };
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Example JWT verification (commented out, install jsonwebtoken package to use)
 */
/*
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

export async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      clinicId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        clinicId: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      permissions: getPermissionsForRole(user.role),
    };
  } catch (error) {
    return null;
  }
}
*/
