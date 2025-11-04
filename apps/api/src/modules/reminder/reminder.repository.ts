import { PrismaClient, Prisma, ReminderStatus } from '@prisma/client';

export const reminderRepository = (prisma: PrismaClient) => ({
  // ==================== ReminderRule Methods ====================

  /**
   * Find reminder rule by ID
   */
  findRuleById: (id: string) =>
    prisma.reminderRule.findUnique({
      where: { id },
      include: {
        clinic: true,
        reminders: true,
      },
    }),

  /**
   * Find all reminder rules for a clinic
   */
  findRulesByClinic: (clinicId: string) =>
    prisma.reminderRule.findMany({
      where: { clinicId },
      include: {
        clinic: true,
      },
      orderBy: [{ offsetMin: 'desc' }, { channel: 'asc' }],
    }),

  /**
   * Find active reminder rules for a clinic
   */
  findActiveRulesByClinic: (clinicId: string) =>
    prisma.reminderRule.findMany({
      where: {
        clinicId,
        active: true,
      },
      include: {
        clinic: true,
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
   */
  createRule: (data: Prisma.ReminderRuleCreateInput) =>
    prisma.reminderRule.create({
      data,
      include: {
        clinic: true,
        reminders: true,
      },
    }),

  /**
   * Update reminder rule by ID
   */
  updateRule: (id: string, data: Prisma.ReminderRuleUpdateInput) =>
    prisma.reminderRule.update({
      where: { id },
      data,
      include: {
        clinic: true,
        reminders: true,
      },
    }),

  /**
   * Activate reminder rule
   */
  activateRule: (id: string) =>
    prisma.reminderRule.update({
      where: { id },
      data: { active: true },
      include: {
        clinic: true,
        reminders: true,
      },
    }),

  /**
   * Deactivate reminder rule
   */
  deactivateRule: (id: string) =>
    prisma.reminderRule.update({
      where: { id },
      data: { active: false },
      include: {
        clinic: true,
        reminders: true,
      },
    }),

  /**
   * Delete reminder rule by ID
   */
  deleteRule: (id: string) =>
    prisma.reminderRule.delete({
      where: { id },
      include: {
        clinic: true,
      },
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
   */
  findReminderById: (id: string) =>
    prisma.reminder.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                clinic: true,
              },
            },
            patient: true,
          },
        },
        rule: true,
      },
    }),

  /**
   * Find reminders with filters
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
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
      orderBy: { scheduledFor: 'asc' },
    });
  },

  /**
   * Find reminders for a specific appointment
   */
  findRemindersByAppointment: (appointmentId: string) =>
    prisma.reminder.findMany({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
      orderBy: { scheduledFor: 'asc' },
    }),

  /**
   * Find scheduled reminders that need to be sent
   */
  findDueReminders: (beforeDate: Date) =>
    prisma.reminder.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: beforeDate,
        },
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
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
   */
  createReminder: (data: Prisma.ReminderCreateInput) =>
    prisma.reminder.create({
      data,
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
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
   */
  updateReminder: (id: string, data: Prisma.ReminderUpdateInput) =>
    prisma.reminder.update({
      where: { id },
      data,
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
    }),

  /**
   * Mark reminder as sent
   */
  markReminderSent: (id: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
    }),

  /**
   * Mark reminder as failed
   */
  markReminderFailed: (id: string, error: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'FAILED',
        error,
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
    }),

  /**
   * Mark reminder as skipped
   */
  markReminderSkipped: (id: string) =>
    prisma.reminder.update({
      where: { id },
      data: {
        status: 'SKIPPED',
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
        rule: true,
      },
    }),

  /**
   * Delete reminder by ID
   */
  deleteReminder: (id: string) =>
    prisma.reminder.delete({
      where: { id },
      include: {
        appointment: true,
        rule: true,
      },
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
