import { userResolver } from '../modules/user/user.resolver';
import { authResolver } from '../modules/auth/auth.resolver';
import { mergeResolvers } from '@graphql-tools/merge';

/**
 * Combined resolvers
 * Merges all module resolvers into a single resolver object
 */
export const resolvers = mergeResolvers([userResolver, authResolver]);
