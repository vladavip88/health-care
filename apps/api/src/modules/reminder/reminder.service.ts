import { GraphQLError } from 'graphql';
import { reminderRepository } from './reminder.repository';
import type { AuthenticatedContext } from '../../common/types/context';
import { ReminderStatus } from '@prisma/client';

interface CreateReminderRuleInput {
  offsetMin: number;
  channel: string;
  active?: boolean;
  template?: string;
}

interface UpdateReminderRuleInput {
  offsetMin?: number;
  channel?: string;
  active?: boolean;
  template?: string;
}

interface ReminderFilterInput {
  appointmentId?: string;
  status?: ReminderStatus;
  channel?: string;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}

export const reminderService = (ctx: AuthenticatedContext) => {
  const repo = reminderRepository(ctx.prisma);

  // ==================== Validation Methods ====================

  /**
   * Validate reminder channel
   */
  const validateChannel = (channel: string) => {
    const validChannels = ['SMS', 'EMAIL'];
    if (!validChannels.includes(channel)) {
      throw new GraphQLError('Channel must be either SMS or EMAIL', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Validate offset minutes (must be positive)
   */
  const validateOffsetMin = (offsetMin: number) => {
    if (offsetMin <= 0) {
      throw new GraphQLError('Offset minutes must be a positive number', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Verify reminder rule belongs to current clinic
   */
  const verifyRuleClinic = async (ruleId: string) => {
    const rule = await repo.findRuleById(ruleId);

    if (!rule) {
      throw new GraphQLError('Reminder rule not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (rule.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Reminder rule belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return rule;
  };

  /**
   * Verify reminder belongs to current clinic (via appointment)
   */
  const verifyReminderClinic = async (reminderId: string) => {
    const reminder = await repo.findReminderById(reminderId);

    if (!reminder) {
      throw new GraphQLError('Reminder not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Load appointment with doctor to verify clinic
    const appointment = await ctx.prisma.appointment.findUnique({
      where: { id: reminder.appointmentId },
      select: { doctorId: true },
    });

    if (!appointment) {
      throw new GraphQLError('Appointment not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const doctor = await ctx.prisma.doctor.findUnique({
      where: { id: appointment.doctorId },
      select: { clinicId: true },
    });

    if (!doctor || doctor.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Reminder belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return reminder;
  };

  /**
   * Verify appointment belongs to current clinic
   */
  const verifyAppointmentClinic = async (appointmentId: string) => {
    const appointment = await ctx.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true },
    });

    if (!appointment) {
      throw new GraphQLError('Appointment not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const doctor = await ctx.prisma.doctor.findUnique({
      where: { id: appointment.doctorId },
      select: { clinicId: true },
    });

    if (!doctor || doctor.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return appointment;
  };

  // ==================== ReminderRule Service Methods ====================

  return {
    /**
     * Get all reminder rules for the clinic
     */
    getRules: async () => {
      return repo.findRulesByClinic(ctx.clinicId);
    },

    /**
     * Get active reminder rules for the clinic
     */
    getActiveRules: async () => {
      return repo.findActiveRulesByClinic(ctx.clinicId);
    },

    /**
     * Get a single reminder rule by ID
     */
    getRuleById: async (id: string) => {
      return verifyRuleClinic(id);
    },

    /**
     * Create a new reminder rule
     */
    createRule: async (data: CreateReminderRuleInput) => {
      // Validate inputs
      validateChannel(data.channel);
      validateOffsetMin(data.offsetMin);

      // Check for exact duplicate
      const exactRule = await repo.findExactRule(ctx.clinicId, data.offsetMin, data.channel);
      if (exactRule) {
        throw new GraphQLError(
          `A reminder rule with ${data.offsetMin} minutes offset and ${data.channel} channel already exists`,
          {
            extensions: { code: 'CONFLICT' },
          }
        );
      }

      const rule = await repo.createRule({
        offsetMin: data.offsetMin,
        channel: data.channel,
        active: data.active ?? true,
        template: data.template,
        clinic: { connect: { id: ctx.clinicId } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminderRule.create',
        entity: 'ReminderRule',
        entityId: rule.id,
        metadata: {
          offsetMin: data.offsetMin,
          channel: data.channel,
          active: data.active ?? true,
        },
      });

      return rule;
    },

    /**
     * Update a reminder rule
     */
    updateRule: async (id: string, data: UpdateReminderRuleInput) => {
      const rule = await verifyRuleClinic(id);

      // Validate inputs if provided
      if (data.channel !== undefined) {
        validateChannel(data.channel);
      }
      if (data.offsetMin !== undefined) {
        validateOffsetMin(data.offsetMin);
      }

      // Check for duplicate if changing offsetMin or channel
      if (data.offsetMin !== undefined || data.channel !== undefined) {
        const newOffsetMin = data.offsetMin ?? rule.offsetMin;
        const newChannel = data.channel ?? rule.channel;

        const exactRule = await repo.findExactRule(ctx.clinicId, newOffsetMin, newChannel);
        if (exactRule && exactRule.id !== id) {
          throw new GraphQLError(
            `A reminder rule with ${newOffsetMin} minutes offset and ${newChannel} channel already exists`,
            {
              extensions: { code: 'CONFLICT' },
            }
          );
        }
      }

      const updatedRule = await repo.updateRule(id, {
        ...(data.offsetMin !== undefined && { offsetMin: data.offsetMin }),
        ...(data.channel !== undefined && { channel: data.channel }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.template !== undefined && { template: data.template }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminderRule.update',
        entity: 'ReminderRule',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedRule;
    },

    /**
     * Delete a reminder rule
     */
    deleteRule: async (id: string) => {
      await verifyRuleClinic(id);

      const deletedRule = await repo.deleteRule(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminderRule.delete',
        entity: 'ReminderRule',
        entityId: id,
        metadata: {
          offsetMin: deletedRule.offsetMin,
          channel: deletedRule.channel,
        },
      });

      return deletedRule;
    },

    /**
     * Activate a reminder rule
     */
    activateRule: async (id: string) => {
      const rule = await verifyRuleClinic(id);

      if (rule.active) {
        throw new GraphQLError('Reminder rule is already active', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const activatedRule = await repo.activateRule(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminderRule.activate',
        entity: 'ReminderRule',
        entityId: id,
      });

      return activatedRule;
    },

    /**
     * Deactivate a reminder rule
     */
    deactivateRule: async (id: string) => {
      const rule = await verifyRuleClinic(id);

      if (!rule.active) {
        throw new GraphQLError('Reminder rule is already inactive', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const deactivatedRule = await repo.deactivateRule(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminderRule.deactivate',
        entity: 'ReminderRule',
        entityId: id,
      });

      return deactivatedRule;
    },

    // ==================== Reminder Service Methods ====================

    /**
     * Get reminders with filters
     */
    getReminders: async (filter?: ReminderFilterInput) => {
      // If DOCTOR role, only show reminders for their appointments
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor) {
          throw new GraphQLError('Doctor profile not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        // Filter to only this doctor's appointments
        const reminders = await repo.findReminders(ctx.clinicId, filter);

        // Load appointment doctor IDs for filtering
        const reminderIds = reminders.map((r) => r.appointmentId);
        const appointments = await ctx.prisma.appointment.findMany({
          where: { id: { in: reminderIds } },
          select: { id: true, doctorId: true },
        });
        const appointmentMap = new Map(appointments.map((a) => [a.id, a]));

        return reminders.filter((r) => appointmentMap.get(r.appointmentId)?.doctorId === doctor.id);
      }

      return repo.findReminders(ctx.clinicId, filter);
    },

    /**
     * Get a single reminder by ID
     */
    getReminderById: async (id: string) => {
      const reminder = await verifyReminderClinic(id);

      // If DOCTOR role, verify it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id: reminder.appointmentId },
          select: { doctorId: true },
        });

        if (!doctor || !appointment || appointment.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: You can only view reminders for your own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return reminder;
    },

    /**
     * Get reminders for a specific appointment
     */
    getRemindersByAppointment: async (appointmentId: string) => {
      await verifyAppointmentClinic(appointmentId);

      // If DOCTOR role, verify it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id: appointmentId },
          select: { doctorId: true },
        });

        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor || !appointment || appointment.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: You can only view reminders for your own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return repo.findRemindersByAppointment(appointmentId);
    },

    /**
     * Generate reminders for an appointment based on active rules
     */
    generateRemindersForAppointment: async (appointmentId: string) => {
      // Verify appointment exists and belongs to current clinic
      await verifyAppointmentClinic(appointmentId);

      // Load full appointment data
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { start: true, doctorId: true },
      });

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Only generate reminders for future appointments
      if (appointment.start <= new Date()) {
        throw new GraphQLError('Cannot generate reminders for past appointments', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Get active reminder rules for the clinic
      const activeRules = await repo.findActiveRulesByClinic(ctx.clinicId);

      if (activeRules.length === 0) {
        throw new GraphQLError('No active reminder rules found for this clinic', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const createdReminders: any[] = [];

      for (const rule of activeRules) {
        // Check if reminder already exists for this appointment and rule
        const existing = await repo.findExistingReminder(appointmentId, rule.id);
        if (existing) {
          continue; // Skip if already exists
        }

        // Calculate scheduled time
        const scheduledFor = new Date(appointment.start.getTime() - rule.offsetMin * 60 * 1000);

        // Don't create reminders that would be sent in the past
        if (scheduledFor <= new Date()) {
          continue;
        }

        const reminder = await repo.createReminder({
          channel: rule.channel,
          scheduledFor,
          status: 'SCHEDULED',
          appointment: { connect: { id: appointmentId } },
          rule: { connect: { id: rule.id } },
        });

        createdReminders.push(reminder);
      }

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminder.generate',
        entity: 'Reminder',
        entityId: appointmentId,
        metadata: {
          appointmentId,
          remindersCreated: createdReminders.length,
        },
      });

      return createdReminders;
    },

    /**
     * Cancel a reminder (mark as skipped)
     */
    cancelReminder: async (id: string) => {
      const reminder = await verifyReminderClinic(id);

      if (reminder.status !== 'SCHEDULED') {
        throw new GraphQLError('Only scheduled reminders can be cancelled', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const cancelledReminder = await repo.markReminderSkipped(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminder.cancel',
        entity: 'Reminder',
        entityId: id,
        metadata: {
          appointmentId: reminder.appointmentId,
        },
      });

      return cancelledReminder;
    },

    /**
     * Mark reminder as sent
     */
    markReminderSent: async (id: string) => {
      const reminder = await verifyReminderClinic(id);

      if (reminder.status !== 'SCHEDULED') {
        throw new GraphQLError('Only scheduled reminders can be marked as sent', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const sentReminder = await repo.markReminderSent(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminder.markSent',
        entity: 'Reminder',
        entityId: id,
        metadata: {
          appointmentId: reminder.appointmentId,
        },
      });

      return sentReminder;
    },

    /**
     * Mark reminder as failed
     */
    markReminderFailed: async (id: string, error: string) => {
      const reminder = await verifyReminderClinic(id);

      if (reminder.status !== 'SCHEDULED') {
        throw new GraphQLError('Only scheduled reminders can be marked as failed', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const failedReminder = await repo.markReminderFailed(id, error);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'reminder.markFailed',
        entity: 'Reminder',
        entityId: id,
        metadata: {
          appointmentId: reminder.appointmentId,
          error,
        },
      });

      return failedReminder;
    },
  };
};
