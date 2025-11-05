import { PrismaClient, Prisma } from '@prisma/client';

export const assistantRepository = (prisma: PrismaClient) => ({
  /**
   * Find assistant by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.assistant.findUnique({
      where: { id },
    }),

  /**
   * Find assistant by user ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  findByUserId: (userId: string) =>
    prisma.assistant.findUnique({
      where: { userId },
    }),

  /**
   * Find all assistants in a clinic
   * Nested relations (user) are resolved by their respective DataLoaders
   */
  findManyByClinic: (clinicId: string) =>
    prisma.assistant.findMany({
      where: { clinicId },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find active assistants in a clinic
   * Nested relations (user) are resolved by their respective DataLoaders
   */
  findActiveByClinic: (clinicId: string) =>
    prisma.assistant.findMany({
      where: {
        clinicId,
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find assistants by permission
   * Nested relations (user) are resolved by their respective DataLoaders
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
    }),

  /**
   * Create a new assistant
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  create: (data: Prisma.AssistantCreateInput) =>
    prisma.assistant.create({
      data,
    }),

  /**
   * Update assistant by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.AssistantUpdateInput) =>
    prisma.assistant.update({
      where: { id },
      data,
    }),

  /**
   * Delete assistant by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.assistant.delete({
      where: { id },
    }),

  /**
   * Deactivate assistant
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  deactivate: (id: string) =>
    prisma.assistant.update({
      where: { id },
      data: { active: false },
    }),

  /**
   * Activate assistant
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  activate: (id: string) =>
    prisma.assistant.update({
      where: { id },
      data: { active: true },
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
