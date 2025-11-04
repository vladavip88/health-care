import { reminderService } from './reminder.service';
import type { Context } from '../../common/context';

export const reminderMutations = {
  // ==================== ReminderRule Mutations ====================

  /**
   * Create a new reminder rule
   * Accessible by: CLINIC_ADMIN
   */
  createReminderRule: async (
    _: any,
    { data }: { data: any },
    ctx: Context
  ) => {
    return reminderService(ctx).createRule(data);
  },

  /**
   * Update a reminder rule
   * Accessible by: CLINIC_ADMIN
   */
  updateReminderRule: async (
    _: any,
    { id, data }: { id: string; data: any },
    ctx: Context
  ) => {
    return reminderService(ctx).updateRule(id, data);
  },

  /**
   * Delete a reminder rule
   * Accessible by: CLINIC_ADMIN
   */
  deleteReminderRule: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return reminderService(ctx).deleteRule(id);
  },

  /**
   * Activate a reminder rule
   * Accessible by: CLINIC_ADMIN
   */
  activateReminderRule: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return reminderService(ctx).activateRule(id);
  },

  /**
   * Deactivate a reminder rule
   * Accessible by: CLINIC_ADMIN
   */
  deactivateReminderRule: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return reminderService(ctx).deactivateRule(id);
  },

  // ==================== Reminder Mutations ====================

  /**
   * Generate reminders for an appointment based on active rules
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  generateRemindersForAppointment: async (
    _: any,
    { appointmentId }: { appointmentId: string },
    ctx: Context
  ) => {
    return reminderService(ctx).generateRemindersForAppointment(appointmentId);
  },

  /**
   * Cancel a reminder (mark as skipped)
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  cancelReminder: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return reminderService(ctx).cancelReminder(id);
  },

  /**
   * Mark a reminder as sent
   * Accessible by: CLINIC_ADMIN
   */
  markReminderSent: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return reminderService(ctx).markReminderSent(id);
  },

  /**
   * Mark a reminder as failed
   * Accessible by: CLINIC_ADMIN
   */
  markReminderFailed: async (
    _: any,
    { id, error }: { id: string; error: string },
    ctx: Context
  ) => {
    return reminderService(ctx).markReminderFailed(id, error);
  },
};
