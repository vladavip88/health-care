import { prisma } from '../../lib/prisma';
import { createUserRepository } from './user.repository';
import { createUserService } from './user.service';
import { createUserQueries } from './user.queries';
import { createUserMutations } from './user.mutations';

// Initialize the layers
const userRepository = createUserRepository(prisma);
const userService = createUserService(userRepository);
const userQueries = createUserQueries(userService);
const userMutations = createUserMutations(userService);

/**
 * User Resolver
 * Combines queries and mutations into a single resolver object
 */
export const userResolver = {
  Query: {
    ...userQueries,
  },
  Mutation: {
    ...userMutations,
  },
};
