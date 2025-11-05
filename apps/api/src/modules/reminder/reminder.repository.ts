import { PrismaClient, Prisma, ReminderStatus } from '@prisma/client';

export const reminderRepository = (prisma: PrismaClient) => ({
  // ==================== ReminderRule Methods ====================

  /**
   * Find reminder rule by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  findRuleById: (id: string) =>
    prisma.reminderRule.findUnique({
      where: { id },
    }),

  /**
   * Find all reminder rules for a clinic
   * Nested relations are resolved by their respective DataLoaders
   */
  findRulesByClinic: (clinicId: string) =>
    prisma.reminderRule.findMany({
      where: { clinicId },
      orderBy: [{ offsetMin: 'desc' }, { channel: 'asc' }],
    }),

  /**
   * Find active reminder rules for a clinic
   * Nested relations are resolved by their respective DataLoaders
   */
  findActiveRulesByClinic: (clinicId: string) =>
    prisma.reminderRule.findMany({
      where: {
        clinicId,
        active: true,
      },
      orderBy: [{ offsetMin: 'desc' }, { channel: 'asc' }],
    }),

  /**
   * Check if exact rule already exists (for duplicate prevention)
   */
  findExactRule: (clinicId: string, offsetMin: number, channel: string) =>
    prisma.reminderRule.findFirst({
      where: {
        clinicId,
        offsetMin,
        channel,
      },
    }),

  /**
   * Create a new reminder rule
   * Nested relations are resolved by their respective DataLoaders
   */
  createRule: (data: Prisma.ReminderRuleCreateInput) =>
    prisma.reminderRule.create({
      data,
    }),

  /**
   * Update reminder rule by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  updateRule: (id: string, data: Prisma.ReminderRuleUpdateInput) =>
    prisma.reminderRule.update({
      where: { id },
      data,
    }),

  /**
   * Activate reminder rule
   * Nested relations are resolved by their respective DataLoaders
   */
  activateRule: (id: string) =>
    prisma.reminderRule.update({
      where: { id },
      data: { active: true },
    }),

  /**
   * Deactivate reminder rule
   * Nested relations are resolved by their respective DataLoaders
   */
  deactivateRule: (id: string) =>
    prisma.reminderRule.update({
      where: { id },
      data: { active: false },
    }),

  /**
   * Delete reminder rule by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  deleteRule: (id: string) =>
    prisma.reminderRule.delete({
      where: { id },
    }),

  /**
   * Count reminder rules for a clinic
   */
  countRules: (clinicId: string) =>
    prisma.reminderRule.count({
      where: { clinicId },
    }),

  /**
   * Count active reminder rules for a clinic
   */
  countActiveRules: (clinicId: string) =>
    prisma.reminderRule.count({
      where: {
        clinicId,
        active: true,
      },
    }),

  // ==================== Reminder Methods ====================

  /**
   * Find reminder by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  findReminderById: (id: string) =>
    prisma.reminder.findUnique({
      where: { id },
    }),

  /**
   * Find reminders with filters
   * Nested relations are resolved by their respective DataLoaders
   */
  findReminders: (clinicId: string, filter?: {
    appointmentId?: string;
    status?: ReminderStatus;
    channel?: string;
    scheduledAfter?: Date;
    scheduledBefore?: Date;
  }) => {
    const where: Prisma.ReminderWhereInput = {
      appointment: {
        doctor: {
          clinicId,
        },
      },
    };

    if (filter?.appointmentId) {
      where.appointmentId = filter.appointmentId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.channel) {
      where.channel = filter.channel;
    }

    if (filter?.scheduledAfter || filter?.scheduledBefore) {
      where.scheduledFor = {};
      if (filter.scheduledAfter) {
        where.scheduledFor.gte = filter.scheduledAfter;
      }
      if (filter.scheduledBefore) {
        where.scheduledFor.lte = filter.scheduledBefore;
      }
    }

    return prisma.reminder.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
    });
  },

  /**
   * Find reminders for a specific appointment
   * Nested relations are resolved by their respective DataLoaders
   */
  findRemindersByAppointment: (appointmentId: string) =>
    prisma.reminder.findMany({
      where: { appointmentId },
      orderBy: { scheduledFor: 'asc' },
    }),

  /**
   * Find scheduled reminders that need to be sent
   * Nested relations are resolved by their respective DataLoaders
   */
  findDueReminders: (beforeDate: Date) =>
    prisma.reminder.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: beforeDate,
        },
      },
      orderBy: { scheduledFor: 'asc' },
    }),

  /**
   * Check if reminder already exists for appointment and rule
   */
  findExistingReminder: (appointmentId: string, ruleId: string) =>
    prisma.reminder.findFirst({
      where: {
        appointmentId,
        ruleId,
      },
    }),

  /**
   * Create a new reminder
   * Nested relations are resolved by their respective DataLoaders
   */
  createReminder: (data: Prisma.ReminderCreateInput) =>
    prisma.reminder.create({
      data,
    }),

  /**
   * Create multiple reminders at once
   */
  createManyReminders: (data: Prisma.ReminderCreateManyInput[]) =>
    prisma.reminder.createMany({
      data,
      skipDuplicates: true,
    }),

  /**
   * Update reminder by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  updateReminder: (id: string, data: Prisma.ReminderUpdateInput) =>
    prisma.reminder.update({
      where: { id },
      data,
    }),

  /**
   * Mark reminder as sent
   * Nested relations are resolved by their respective DataLoaders
   */
  markReminderSent: (id: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    }),

  /**
   * Mark reminder as failed
   * Nested relations are resolved by their respective DataLoaders
   */
  markReminderFailed: (id: string, error: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'FAILED',
        error,
      },
    }),

  /**
   * Mark reminder as skipped
   * Nested relations are resolved by their respective DataLoaders
   */
  markReminderSkipped: (id: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'SKIPPED',
      },
    }),

  /**
   * Delete reminder by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  deleteReminder: (id: string) =>
    prisma.reminder.delete({
      where: { id },
    }),

  /**
   * Delete all reminders for an appointment
   */
  deleteRemindersByAppointment: (appointmentId: string) =>
    prisma.reminder.deleteMany({
      where: { appointmentId },
    }),

  /**
   * Count reminders
   */
  countReminders: (clinicId: string, status?: ReminderStatus) => {
    const where: Prisma.ReminderWhereInput = {
      appointment: {
        doctor: {
          clinicId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    return prisma.reminder.count({ where });
  },
});
