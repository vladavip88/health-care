import { PrismaClient, Prisma } from '@prisma/client';

export const webhookEndpointRepository = (prisma: PrismaClient) => ({
  /**
   * Find webhook endpoint by ID
   */
  findById: (id: string) =>
    prisma.webhookEndpoint.findUnique({
      where: { id },
      include: {
        clinic: true,
      },
    }),

  /**
   * Find all webhook endpoints for a clinic
   */
  findByClinic: (clinicId: string) =>
    prisma.webhookEndpoint.findMany({
      where: { clinicId },
      include: {
        clinic: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find active webhook endpoints for a clinic
   */
  findActiveByClinic: (clinicId: string) =>
    prisma.webhookEndpoint.findMany({
      where: {
        clinicId,
        active: true,
      },
      include: {
        clinic: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find webhook endpoints by event type
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
      include: {
        clinic: true,
      },
    }),

  /**
   * Find webhook endpoints with filters
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
      include: {
        clinic: true,
      },
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
   */
  create: (data: Prisma.WebhookEndpointCreateInput) =>
    prisma.webhookEndpoint.create({
      data,
      include: {
        clinic: true,
      },
    }),

  /**
   * Update webhook endpoint by ID
   */
  update: (id: string, data: Prisma.WebhookEndpointUpdateInput) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data,
      include: {
        clinic: true,
      },
    }),

  /**
   * Activate webhook endpoint
   */
  activate: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: { active: true },
      include: {
        clinic: true,
      },
    }),

  /**
   * Deactivate webhook endpoint
   */
  deactivate: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: { active: false },
      include: {
        clinic: true,
      },
    }),

  /**
   * Update last success timestamp
   */
  recordSuccess: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: {
        lastSuccessAt: new Date(),
        failureCount: 0,
      },
      include: {
        clinic: true,
      },
    }),

  /**
   * Update last failure timestamp and increment failure count
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
      include: {
        clinic: true,
      },
    }),

  /**
   * Reset failure count
   */
  resetFailureCount: (id: string) =>
    prisma.webhookEndpoint.update({
      where: { id },
      data: {
        failureCount: 0,
      },
      include: {
        clinic: true,
      },
    }),

  /**
   * Delete webhook endpoint by ID
   */
  delete: (id: string) =>
    prisma.webhookEndpoint.delete({
      where: { id },
      include: {
        clinic: true,
      },
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
