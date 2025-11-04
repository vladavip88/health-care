import type { UserService } from './user.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';
import type { Role } from '@prisma/client';

export interface GetUsersArgs {
  role?: Role;
  active?: boolean;
  search?: string;
}

export interface GetUserArgs {
  id: string;
}

/**
 * User Queries
 * Read-only GraphQL operations
 */
export function createUserQueries(service: UserService) {
  return {
    /**
     * Get a single user by ID
     */
    user: async (_parent: unknown, args: GetUserArgs, context: Context) => {
      return service.getUserById(args.id, context as AuthenticatedContext);
    },

    /**
     * Get all users in the clinic with optional filters
     */
    users: async (_parent: unknown, args: GetUsersArgs, context: Context) => {
      return service.getUsers(context as AuthenticatedContext, {
        role: args.role,
        active: args.active,
        search: args.search,
      });
    },

    /**
     * Search users by name or email
     */
    searchUsers: async (_parent: unknown, args: { query: string }, context: Context) => {
      return service.searchUsers(args.query, context as AuthenticatedContext);
    },
  };
}
