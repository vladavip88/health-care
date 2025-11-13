import type { AuthService } from './auth.service';
import type { RegisterInput, LoginInput, RegisterCompanyInput } from './auth.types';
import type { Context } from '../../common/types/context';

/**
 * Auth Mutations
 * Authentication-related GraphQL operations
 */
export function createAuthMutations(service: AuthService) {
  return {
    /**
     * Register a new company with admin user
     * Public mutation - no authentication required
     */
    registerCompany: async (_parent: unknown, args: { input: RegisterCompanyInput }, context: Context) => {
      return service.registerCompany(args.input, context);
    },

    /**
     * Register a new user
     * Public mutation - no authentication required
     */
    register: async (_parent: unknown, args: { input: RegisterInput }, context: Context) => {
      return service.register(args.input, context);
    },

    /**
     * Login user - returns user and list of available clinics
     * Public mutation - no authentication required
     */
    login: async (_parent: unknown, args: { input: LoginInput }, context: Context) => {
      return service.login(args.input, context);
    },

    /**
     * Select clinic and finalize login
     * Public mutation - no authentication required
     */
    selectClinic: async (_parent: unknown, args: { email: string; password: string; clinicId: string }, context: Context) => {
      return service.selectClinic(args.email, args.password, args.clinicId, context);
    },

    /**
     * Refresh access token using refresh token
     * Public mutation - no authentication required
     */
    refreshToken: async (_parent: unknown, args: { refreshToken: string }, context: Context) => {
      return service.refreshToken(args.refreshToken, context);
    },

    /**
     * Logout user (invalidate refresh token)
     * Public mutation - can be called with or without authentication
     */
    logout: async (_parent: unknown, args: { refreshToken: string }, context: Context) => {
      return service.logout(args.refreshToken, context);
    },

    /**
     * Logout from all devices
     * Requires authentication
     */
    logoutAll: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        return false;
      }
      return service.logoutAll(context.user.id, context);
    },
  };
}
