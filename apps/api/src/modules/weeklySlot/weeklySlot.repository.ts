import { PrismaClient, Prisma } from '@prisma/client';

export const weeklySlotRepository = (prisma: PrismaClient) => ({
  /**
   * Find weekly slot by ID
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.weeklySlot.findUnique({
      where: { id },
    }),

  /**
   * Find all weekly slots for a doctor
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  findByDoctor: (doctorId: string) =>
    prisma.weeklySlot.findMany({
      where: { doctorId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),

  /**
   * Find active weekly slots for a doctor
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  findActiveByDoctor: (doctorId: string) =>
    prisma.weeklySlot.findMany({
      where: {
        doctorId,
        active: true,
      },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),

  /**
   * Find weekly slots by weekday
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  findByWeekday: (doctorId: string, weekday: number) =>
    prisma.weeklySlot.findMany({
      where: {
        doctorId,
        weekday,
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
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  create: (data: Prisma.WeeklySlotCreateInput) =>
    prisma.weeklySlot.create({
      data,
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
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.WeeklySlotUpdateInput) =>
    prisma.weeklySlot.update({
      where: { id },
      data,
    }),

  /**
   * Activate weekly slot
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  activate: (id: string) =>
    prisma.weeklySlot.update({
      where: { id },
      data: { active: true },
    }),

  /**
   * Deactivate weekly slot
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  deactivate: (id: string) =>
    prisma.weeklySlot.update({
      where: { id },
      data: { active: false },
    }),

  /**
   * Delete weekly slot by ID
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.weeklySlot.delete({
      where: { id },
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
