import { PrismaClient, Prisma } from '@prisma/client';

export const assistantRepository = (prisma: PrismaClient) => ({
  /**
   * Find assistant by ID
   */
  findById: (id: string) =>
    prisma.assistant.findUnique({
      where: { id },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Find assistant by user ID
   */
  findByUserId: (userId: string) =>
    prisma.assistant.findUnique({
      where: { userId },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Find all assistants in a clinic
   */
  findManyByClinic: (clinicId: string) =>
    prisma.assistant.findMany({
      where: { clinicId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find active assistants in a clinic
   */
  findActiveByClinic: (clinicId: string) =>
    prisma.assistant.findMany({
      where: {
        clinicId,
        active: true,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find assistants by permission
   */
  findByPermission: (clinicId: string, permission: string) =>
    prisma.assistant.findMany({
      where: {
        clinicId,
        permissions: {
          has: permission,
        },
        active: true,
      },
      include: {
        user: true,
      },
    }),

  /**
   * Create a new assistant
   */
  create: (data: Prisma.AssistantCreateInput) =>
    prisma.assistant.create({
      data,
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Update assistant by ID
   */
  update: (id: string, data: Prisma.AssistantUpdateInput) =>
    prisma.assistant.update({
      where: { id },
      data,
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Delete assistant by ID
   */
  delete: (id: string) =>
    prisma.assistant.delete({
      where: { id },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Deactivate assistant
   */
  deactivate: (id: string) =>
    prisma.assistant.update({
      where: { id },
      data: { active: false },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Activate assistant
   */
  activate: (id: string) =>
    prisma.assistant.update({
      where: { id },
      data: { active: true },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Count assistants in a clinic
   */
  count: (clinicId: string) =>
    prisma.assistant.count({
      where: { clinicId },
    }),

  /**
   * Count active assistants in a clinic
   */
  countActive: (clinicId: string) =>
    prisma.assistant.count({
      where: {
        clinicId,
        active: true,
      },
    }),

  /**
   * Check if assistant exists
   */
  exists: (id: string) =>
    prisma.assistant
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),
});
