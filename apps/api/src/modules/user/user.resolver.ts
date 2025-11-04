import { prisma } from '../../lib/prisma';
import { createUserRepository } from './user.repository';
import { createUserService } from './user.service';
import { createUserQueries } from './user.queries';
import { createUserMutations } from './user.mutations';
import type { Context } from '../../common/types/context';
import type { User } from '@prisma/client';

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
  User: {
    // Resolve nested clinic via DataLoader
    clinic: (parent: User, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
    // Resolve nested doctor profile via DataLoader (optional 1:1 relationship)
    doctor: (parent: User, _: unknown, ctx: Context) => {
      return ctx.loaders.doctorByUserId.load(parent.id);
    },
    // Resolve nested assistant profile via DataLoader (optional 1:1 relationship)
    assistant: (parent: User, _: unknown, ctx: Context) => {
      return ctx.loaders.assistantByUserId.load(parent.id);
    },
    // Resolve nested patient profile via DataLoader (optional 1:1 relationship)
    patient: (parent: User, _: unknown, ctx: Context) => {
      return ctx.loaders.patientByUserId.load(parent.id);
    },
  },
};
