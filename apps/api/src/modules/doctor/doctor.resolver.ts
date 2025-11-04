import { doctorQueries } from './doctor.queries';
import { doctorMutations } from './doctor.mutations';
import type { Context } from '../../common/types/context';
import type { Doctor } from '@prisma/client';

export const doctorResolver = {
  Query: {
    ...doctorQueries,
  },
  Mutation: {
    ...doctorMutations,
  },
  Doctor: {
    // Resolve nested user via DataLoader
    user: (parent: Doctor, _: unknown, ctx: Context) => {
      if (!parent.userId) return null;
      return ctx.loaders.user.load(parent.userId);
    },
    // Resolve nested clinic via DataLoader
    clinic: (parent: Doctor, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
    // Resolve nested appointments via DataLoader
    appointments: (parent: Doctor, _: unknown, ctx: Context) => {
      return ctx.loaders.appointmentsByDoctor.load(parent.id);
    },
    // Resolve nested weekly slots via DataLoader
    slots: (parent: Doctor, _: unknown, ctx: Context) => {
      return ctx.loaders.weeklySlotsByDoctor.load(parent.id);
    },
  },
};
