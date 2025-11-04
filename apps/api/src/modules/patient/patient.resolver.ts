import { patientQueries } from './patient.queries';
import { patientMutations } from './patient.mutations';
import type { Context } from '../../common/types/context';
import type { Patient } from '@prisma/client';

export const patientResolver = {
  Query: {
    ...patientQueries,
  },
  Mutation: {
    ...patientMutations,
  },
  Patient: {
    // Resolve nested user via DataLoader (optional relationship)
    user: (parent: Patient, _: unknown, ctx: Context) => {
      if (!parent.userId) return null;
      return ctx.loaders.user.load(parent.userId);
    },
    // Resolve nested clinic via DataLoader
    clinic: (parent: Patient, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
    // Resolve nested appointments via DataLoader
    appointments: (parent: Patient, _: unknown, ctx: Context) => {
      return ctx.loaders.appointmentsByPatient.load(parent.id);
    },
  },
};
