import { reminderService } from './reminder.service';
import type { Context } from '../../common/types/context';

export const reminderQueries = {
  // ==================== ReminderRule Queries ====================

  /**
   * Get all reminder rules for the clinic
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  reminderRules: async (_: any, __: any, ctx: Context) => {
    return reminderService(ctx).getRules();
  },

  /**
   * Get a single reminder rule by ID
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  reminderRule: async (_: any, { id }: { id: string }, ctx: Context) => {
    return reminderService(ctx).getRuleById(id);
  },

  /**
   * Get active reminder rules for the clinic
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  activeReminderRules: async (_: any, __: any, ctx: Context) => {
    return reminderService(ctx).getActiveRules();
  },

  // ==================== Reminder Queries ====================

  /**
   * Get reminders with optional filters
   * Accessible by: CLINIC_ADMIN, ASSISTANT, DOCTOR (own appointments only)
   */
  reminders: async (
    _: any,
    { filter }: { filter?: any },
    ctx: Context
  ) => {
    return reminderService(ctx).getReminders(filter);
  },

  /**
   * Get a single reminder by ID
   * Accessible by: CLINIC_ADMIN, ASSISTANT, DOCTOR (own appointments only)
   */
  reminder: async (_: any, { id }: { id: string }, ctx: Context) => {
    return reminderService(ctx).getReminderById(id);
  },

  /**
   * Get reminders for a specific appointment
   * Accessible by: CLINIC_ADMIN, ASSISTANT, DOCTOR (own appointments only)
   */
  appointmentReminders: async (
    _: any,
    { appointmentId }: { appointmentId: string },
    ctx: Context
  ) => {
    return reminderService(ctx).getRemindersByAppointment(appointmentId);
  },
};
