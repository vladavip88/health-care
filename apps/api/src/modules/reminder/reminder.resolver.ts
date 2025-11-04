import { reminderQueries } from './reminder.queries';
import { reminderMutations } from './reminder.mutations';
import type { Context } from '../../common/types/context';
import type { Reminder, ReminderRule } from '@prisma/client';

export const reminderResolver = {
  Query: {
    ...reminderQueries,
  },
  Mutation: {
    ...reminderMutations,
  },
  Reminder: {
    // Resolve nested appointment via DataLoader
    appointment: (parent: Reminder, _: unknown, ctx: Context) => {
      if (!parent.appointmentId) return null;
      return ctx.loaders.appointment.load(parent.appointmentId);
    },
    // Resolve nested rule via DataLoader (optional)
    rule: (parent: Reminder, _: unknown, ctx: Context) => {
      if (!parent.ruleId) return null;
      return ctx.loaders.reminderRule.load(parent.ruleId);
    },
  },
  ReminderRule: {
    // Resolve nested clinic via DataLoader
    clinic: (parent: ReminderRule, _: unknown, ctx: Context) => {
      if (!parent.clinicId) return null;
      return ctx.loaders.clinic.load(parent.clinicId);
    },
  },
};
