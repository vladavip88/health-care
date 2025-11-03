import type { AuthService } from './auth.service';
import type { RegisterInput, LoginInput } from './auth.types';
import type { Context } from '../../common/types/context';

/**
 * Auth Mutations
 * Authentication-related GraphQL operations
 */
export function createAuthMutations(service: AuthService) {
  return {
    /**
     * Register a new user
     * Public mutation - no authentication required
     */
    register: async (_parent: unknown, args: { input: RegisterInput }) => {
      return service.register(args.input);
    },

    /**
     * Login user
     * Public mutation - no authentication required
     */
    login: async (_parent: unknown, args: { input: LoginInput }) => {
      return service.login(args.input);
    },

    /**
     * Refresh access token using refresh token
     * Public mutation - no authentication required
     */
    refreshToken: async (_parent: unknown, args: { refreshToken: string }) => {
      return service.refreshToken(args.refreshToken);
    },

    /**
     * Logout user (invalidate refresh token)
     * Public mutation - can be called with or without authentication
     */
    logout: async (_parent: unknown, args: { refreshToken: string }) => {
      return service.logout(args.refreshToken);
    },

    /**
     * Logout from all devices
     * Requires authentication
     */
    logoutAll: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        return false;
      }
      return service.logoutAll(context.user.id);
    },
  };
}
