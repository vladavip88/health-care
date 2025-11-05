import { PrismaClient, Prisma } from '@prisma/client';

export const webhookEndpointRepository = (prisma: PrismaClient) => ({
  /**
   * Find webhook endpoint by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.webhookEndpoint.findUnique({
      where: { id },
    }),

  /**
   * Find all webhook endpoints for a clinic
   * Nested relations are resolved by their respective DataLoaders
   */
  findByClinic: (clinicId: string) =>
    prisma.webhookEndpoint.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find active webhook endpoints for a clinic
   * Nested relations are resolved by their respective DataLoaders
   */
  findActiveByClinic: (clinicId: string) =>
    prisma.webhookEndpoint.findMany({
      where: {
        clinicId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find webhook endpoints by event type
   * Nested relations are resolved by their respective DataLoaders
   */
  findByEvent: (clinicId: string, event: string) =>
    prisma.webhookEndpoint.findMany({
      where: {
        clinicId,
        active: true,
        events: {
          has: event,
        },
      },
    }),

  /**
   * Find webhook endpoints with filters
   * Nested relations are resolved by their respective DataLoaders
   */
  findWithFilters: (clinicId: string, filter?: { active?: boolean; event?: string }) => {
    const where: Prisma.WebhookEndpointWhereInput = {
      clinicId,
    };

    if (filter?.active !== undefined) {
      where.active = filter.active;
    }

    if (filter?.event) {
      where.events = {
        has: filter.event,
      };
    }

    return prisma.webhookEndpoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Check if exact webhook already exists (same URL for clinic)
   */
  findExact: (clinicId: string, url: string) =>
    prisma.webhookEndpoint.findFirst({
      where: {
        clinicId,
        url,
      },
    }),

  /**
   * Create a new webhook endpoint
   * Nested relations are resolved by their respective DataLoaders
   */
  create: (data: Prisma.WebhookEndpointCreateInput) =>
    prisma.webhookEndpoint.create({
      data,
    }),

  /**
   * Update webhook endpoint by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.WebhookEndpointUpdateInput) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data,
    }),

  /**
   * Activate webhook endpoint
   * Nested relations are resolved by their respective DataLoaders
   */
  activate: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: { active: true },
    }),

  /**
   * Deactivate webhook endpoint
   * Nested relations are resolved by their respective DataLoaders
   */
  deactivate: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: { active: false },
    }),

  /**
   * Update last success timestamp
   * Nested relations are resolved by their respective DataLoaders
   */
  recordSuccess: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: {
        lastSuccessAt: new Date(),
        failureCount: 0,
      },
    }),

  /**
   * Update last failure timestamp and increment failure count
   * Nested relations are resolved by their respective DataLoaders
   */
  recordFailure: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: {
        lastFailureAt: new Date(),
        failureCount: {
          increment: 1,
        },
      },
    }),

  /**
   * Reset failure count
   * Nested relations are resolved by their respective DataLoaders
   */
  resetFailureCount: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: {
        failureCount: 0,
      },
    }),

  /**
   * Delete webhook endpoint by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.webhookEndpoint.delete({
      where: { id },
    }),

  /**
   * Delete all webhook endpoints for a clinic
   */
  deleteByClinic: (clinicId: string) =>
    prisma.webhookEndpoint.deleteMany({
      where: { clinicId },
    }),

  /**
   * Count webhook endpoints for a clinic
   */
  count: (clinicId: string) =>
    prisma.webhookEndpoint.count({
      where: { clinicId },
    }),

  /**
   * Count active webhook endpoints for a clinic
   */
  countActive: (clinicId: string) =>
    prisma.webhookEndpoint.count({
      where: {
        clinicId,
        active: true,
      },
    }),

  /**
   * Check if webhook endpoint exists
   */
  exists: (id: string) =>
    prisma.webhookEndpoint
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),
});
