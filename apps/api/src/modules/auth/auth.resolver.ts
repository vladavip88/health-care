import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { createAuthRepository } from './auth.repository';
import { createAuthService } from './auth.service';
import { createAuthMutations } from './auth.mutations';

// Initialize the layers
const authRepository = createAuthRepository(prisma, redis);
const authService = createAuthService(authRepository);
const authMutations = createAuthMutations(authService);

/**
 * Auth Resolver
 * Combines mutations into a single resolver object
 * Note: Auth typically has no queries (login/register are mutations)
 */
export const authResolver = {
  Mutation: {
    ...authMutations,
  },
};

// Export service for use in auth middleware
export { authService };
