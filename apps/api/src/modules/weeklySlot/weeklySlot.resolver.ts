import { weeklySlotQueries } from './weeklySlot.queries';
import { weeklySlotMutations } from './weeklySlot.mutations';
import type { Context } from '../../common/types/context';
import type { WeeklySlot } from '@prisma/client';

export const weeklySlotResolver = {
  Query: {
    ...weeklySlotQueries,
  },
  Mutation: {
    ...weeklySlotMutations,
  },
  WeeklySlot: {
    // Resolve nested doctor via DataLoader
    doctor: (parent: WeeklySlot, _: unknown, ctx: Context) => {
      if (!parent.doctorId) return null;
      return ctx.loaders.doctor.load(parent.doctorId);
    },
  },
};
