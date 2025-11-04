import { assistantQueries } from './assistant.queries';
import { assistantMutations } from './assistant.mutations';
import type { Context } from '../../common/types/context';
import type { Assistant } from '@prisma/client';

export const assistantResolver = {
  Query: {
    ...assistantQueries,
  },
  Mutation: {
    ...assistantMutations,
  },
  Assistant: {
    // Resolve nested user via DataLoader
    user: (parent: Assistant, _: unknown, ctx: Context) => {
      if (!parent.userId) return null;
      return ctx.loaders.user.load(parent.userId);
    },
    // Resolve nested clinic via DataLoader
    clinic: (parent: Assistant, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
  },
};
