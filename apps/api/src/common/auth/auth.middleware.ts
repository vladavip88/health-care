import { authService } from '../../modules/auth/auth.resolver';
import type { AuthUser } from '../types/context';

/**
 * Authentication middleware
 * Verifies JWT access tokens and returns authenticated user
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

  try {
    // Verify JWT and get user data
    const user = await authService.getUserFromToken(token);
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
