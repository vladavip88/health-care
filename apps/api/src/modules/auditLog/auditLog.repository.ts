import { PrismaClient, Prisma } from '@prisma/client';

export const auditLogRepository = (prisma: PrismaClient) => ({
  /**
   * Find audit log by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.auditLog.findUnique({
      where: { id },
    }),

  /**
   * Find audit logs with filters
   * Nested relations are resolved by their respective DataLoaders
   */
  findWithFilters: (
    clinicId: string,
    filter?: {
      actorId?: string;
      entity?: string;
      action?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
      appointmentId?: string;
    },
    options?: {
      limit?: number;
      offset?: number;
    }
  ) => {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
    };

    if (filter?.actorId) {
      where.actorId = filter.actorId;
    }

    if (filter?.entity) {
      where.entity = filter.entity;
    }

    if (filter?.action) {
      where.action = filter.action;
    }

    if (filter?.entityId) {
      where.entityId = filter.entityId;
    }

    if (filter?.appointmentId) {
      where.appointmentId = filter.appointmentId;
    }

    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });
  },

  /**
   * Find audit logs by entity
   * Nested relations are resolved by their respective DataLoaders
   */
  findByEntity: (clinicId: string, entity: string, entityId: string) =>
    prisma.auditLog.findMany({
      where: {
        clinicId,
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find audit logs by actor
   * Nested relations are resolved by their respective DataLoaders
   */
  findByActor: (clinicId: string, actorId: string, options?: { limit?: number; offset?: number }) =>
    prisma.auditLog.findMany({
      where: {
        clinicId,
        actorId,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    }),

  /**
   * Find audit logs by appointment
   * Nested relations are resolved by their respective DataLoaders
   */
  findByAppointment: (appointmentId: string) =>
    prisma.auditLog.findMany({
      where: {
        appointmentId,
      },
      orderBy: { createdAt: 'desc' },
    }),

  /**
   * Find audit logs by action
   * Nested relations are resolved by their respective DataLoaders
   */
  findByAction: (clinicId: string, action: string, options?: { limit?: number; offset?: number }) =>
    prisma.auditLog.findMany({
      where: {
        clinicId,
        action,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    }),

  /**
   * Find recent audit logs
   * Nested relations are resolved by their respective DataLoaders
   */
  findRecent: (clinicId: string, limit: number = 100) =>
    prisma.auditLog.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

  /**
   * Create a new audit log
   * Nested relations are resolved by their respective DataLoaders
   */
  create: (data: Prisma.AuditLogCreateInput) =>
    prisma.auditLog.create({
      data,
    }),

  /**
   * Create multiple audit logs at once
   */
  createMany: (data: Prisma.AuditLogCreateManyInput[]) =>
    prisma.auditLog.createMany({
      data,
    }),

  /**
   * Delete audit log by ID
   * Nested relations are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.auditLog.delete({
      where: { id },
    }),

  /**
   * Delete audit logs by entity
   */
  deleteByEntity: (clinicId: string, entity: string, entityId: string) =>
    prisma.auditLog.deleteMany({
      where: {
        clinicId,
        entity,
        entityId,
      },
    }),

  /**
   * Delete audit logs older than a specific date
   */
  deleteOlderThan: (clinicId: string, date: Date) =>
    prisma.auditLog.deleteMany({
      where: {
        clinicId,
        createdAt: {
          lt: date,
        },
      },
    }),

  /**
   * Delete all audit logs for a clinic
   */
  deleteByClinic: (clinicId: string) =>
    prisma.auditLog.deleteMany({
      where: { clinicId },
    }),

  /**
   * Count audit logs with filters
   */
  count: (
    clinicId: string,
    filter?: {
      actorId?: string;
      entity?: string;
      action?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
      appointmentId?: string;
    }
  ) => {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
    };

    if (filter?.actorId) {
      where.actorId = filter.actorId;
    }

    if (filter?.entity) {
      where.entity = filter.entity;
    }

    if (filter?.action) {
      where.action = filter.action;
    }

    if (filter?.entityId) {
      where.entityId = filter.entityId;
    }

    if (filter?.appointmentId) {
      where.appointmentId = filter.appointmentId;
    }

    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    return prisma.auditLog.count({ where });
  },

  /**
   * Count total audit logs for a clinic
   */
  countAll: (clinicId: string) =>
    prisma.auditLog.count({
      where: { clinicId },
    }),

  /**
   * Get audit log statistics by action
   */
  getStatsByAction: async (clinicId: string, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    return prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });
  },

  /**
   * Get audit log statistics by entity
   */
  getStatsByEntity: async (clinicId: string, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    return prisma.auditLog.groupBy({
      by: ['entity'],
      where,
      _count: {
        entity: true,
      },
      orderBy: {
        _count: {
          entity: 'desc',
        },
      },
    });
  },

  /**
   * Get audit log statistics by actor
   */
  getStatsByActor: async (clinicId: string, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    return prisma.auditLog.groupBy({
      by: ['actorId'],
      where,
      _count: {
        actorId: true,
      },
      orderBy: {
        _count: {
          actorId: 'desc',
        },
      },
    });
  },
});
