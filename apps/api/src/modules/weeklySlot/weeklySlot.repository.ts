import { PrismaClient, Prisma } from '@prisma/client';

export const weeklySlotRepository = (prisma: PrismaClient) => ({
  /**
   * Find weekly slot by ID
   */
  findById: (id: string) =>
    prisma.weeklySlot.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Find all weekly slots for a doctor
   */
  findByDoctor: (doctorId: string) =>
    prisma.weeklySlot.findMany({
      where: { doctorId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),

  /**
   * Find active weekly slots for a doctor
   */
  findActiveByDoctor: (doctorId: string) =>
    prisma.weeklySlot.findMany({
      where: {
        doctorId,
        active: true,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),

  /**
   * Find weekly slots by weekday
   */
  findByWeekday: (doctorId: string, weekday: number) =>
    prisma.weeklySlot.findMany({
      where: {
        doctorId,
        weekday,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),

  /**
   * Check for overlapping slots
   */
  findOverlapping: (doctorId: string, weekday: number, startTime: string, endTime: string, excludeId?: string) => {
    const where: Prisma.WeeklySlotWhereInput = {
      doctorId,
      weekday,
      OR: [
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
      ],
      active: true,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return prisma.weeklySlot.findFirst({ where });
  },

  /**
   * Create a new weekly slot
   */
  create: (data: Prisma.WeeklySlotCreateInput) =>
    prisma.weeklySlot.create({
      data,
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Create multiple weekly slots at once
   */
  createMany: (data: Prisma.WeeklySlotCreateManyInput[]) =>
    prisma.weeklySlot.createMany({
      data,
      skipDuplicates: true,
    }),

  /**
   * Update weekly slot by ID
   */
  update: (id: string, data: Prisma.WeeklySlotUpdateInput) =>
    prisma.weeklySlot.update({
      where: { id },
      data,
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Activate weekly slot
   */
  activate: (id: string) =>
    prisma.weeklySlot.update({
      where: { id },
      data: { active: true },
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Deactivate weekly slot
   */
  deactivate: (id: string) =>
    prisma.weeklySlot.update({
      where: { id },
      data: { active: false },
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Delete weekly slot by ID
   */
  delete: (id: string) =>
    prisma.weeklySlot.delete({
      where: { id },
      include: {
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    }),

  /**
   * Delete all weekly slots for a doctor
   */
  deleteByDoctor: (doctorId: string) =>
    prisma.weeklySlot.deleteMany({
      where: { doctorId },
    }),

  /**
   * Count weekly slots for a doctor
   */
  count: (doctorId: string) =>
    prisma.weeklySlot.count({
      where: { doctorId },
    }),

  /**
   * Count active weekly slots for a doctor
   */
  countActive: (doctorId: string) =>
    prisma.weeklySlot.count({
      where: {
        doctorId,
        active: true,
      },
    }),

  /**
   * Check if weekly slot exists
   */
  exists: (id: string) =>
    prisma.weeklySlot
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),

  /**
   * Check if exact slot already exists (for duplicate prevention)
   */
  findExact: (doctorId: string, weekday: number, startTime: string, endTime: string) =>
    prisma.weeklySlot.findFirst({
      where: {
        doctorId,
        weekday,
        startTime,
        endTime,
      },
    }),
});
