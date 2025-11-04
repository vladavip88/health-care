import { appointmentQueries } from './appointment.queries';
import { appointmentMutations } from './appointment.mutations';
import type { Context } from '../../common/types/context';
import type { Appointment } from '@prisma/client';

export const appointmentResolver = {
  Query: {
    ...appointmentQueries,
  },
  Mutation: {
    ...appointmentMutations,
  },
  Appointment: {
    // Resolve nested clinic via DataLoader
    clinic: (parent: Appointment, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
    // Resolve nested doctor via DataLoader
    doctor: (parent: Appointment, _: unknown, ctx: Context) => {
      if (!parent.doctorId) return null;
      return ctx.loaders.doctor.load(parent.doctorId);
    },
    // Resolve nested patient via DataLoader
    patient: (parent: Appointment, _: unknown, ctx: Context) => {
      if (!parent.patientId) return null;
      return ctx.loaders.patient.load(parent.patientId);
    },
    // Resolve nested createdBy user via DataLoader
    createdBy: (parent: Appointment, _: unknown, ctx: Context) => {
      if (!parent.createdById) return null;
      return ctx.loaders.user.load(parent.createdById);
    },
    // Resolve nested reminders via DataLoader
    reminders: (parent: Appointment, _: unknown, ctx: Context) => {
      return ctx.loaders.remindersByAppointment.load(parent.id);
    },
  },
};
