import type { UserService, CreateUserInput, UpdateUserInput } from './user.service';
import type { Context } from '../../common/types/context';

/**
 * User Mutations
 * Write GraphQL operations
 */
export function createUserMutations(service: UserService) {
  return {
    /**
     * Create a new user
     */
    createUser: async (_parent: unknown, args: CreateUserInput, context: Context) => {
      return service.createUser(args, context);
    },

    /**
     * Update an existing user
     */
    updateUser: async (_parent: unknown, args: UpdateUserInput, context: Context) => {
      return service.updateUser(args, context);
    },

    /**
     * Delete a user
     */
    deleteUser: async (_parent: unknown, args: { id: string }, context: Context) => {
      return service.deleteUser(args.id, context);
    },
  };
}
