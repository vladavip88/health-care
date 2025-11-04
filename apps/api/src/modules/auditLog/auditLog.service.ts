import { GraphQLError } from 'graphql';
import { auditLogRepository } from './auditLog.repository';
import type { Context } from '../../common/types/context';

interface AuditLogFilterInput {
  actorId?: string;
  entity?: string;
  action?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  appointmentId?: string;
}

interface CreateAuditLogInput {
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  appointmentId?: string;
}

export const auditLogService = (ctx: Context) => {
  const repo = auditLogRepository(ctx.prisma);

  // ==================== Validation Methods ====================

  /**
   * Verify audit log belongs to current clinic
   */
  const verifyAuditLogClinic = async (auditLogId: string) => {
    const auditLog = await repo.findById(auditLogId);

    if (!auditLog) {
      throw new GraphQLError('Audit log not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (auditLog.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Audit log belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return auditLog;
  };

  /**
   * Verify appointment belongs to current clinic (for appointment-specific logs)
   */
  const verifyAppointmentClinic = async (appointmentId: string) => {
    const appointment = await ctx.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    });

    if (!appointment) {
      throw new GraphQLError('Appointment not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (appointment.doctor.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return appointment;
  };

  // ==================== Service Methods ====================

  return {
    /**
     * Get audit logs with filters and pagination
     */
    getAuditLogs: async (filter?: AuditLogFilterInput, limit?: number, offset?: number) => {
      return repo.findWithFilters(ctx.clinicId, filter, { limit, offset });
    },

    /**
     * Get a single audit log by ID
     */
    getById: async (id: string) => {
      return verifyAuditLogClinic(id);
    },

    /**
     * Get audit logs for a specific entity
     */
    getByEntity: async (entity: string, entityId: string) => {
      return repo.findByEntity(ctx.clinicId, entity, entityId);
    },

    /**
     * Get audit logs for a specific actor (user)
     */
    getByActor: async (actorId: string, limit?: number, offset?: number) => {
      // Verify actor belongs to clinic
      const actor = await ctx.prisma.user.findUnique({
        where: { id: actorId },
      });

      if (!actor) {
        throw new GraphQLError('Actor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (actor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Actor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return repo.findByActor(ctx.clinicId, actorId, { limit, offset });
    },

    /**
     * Get audit logs for a specific appointment
     */
    getByAppointment: async (appointmentId: string) => {
      await verifyAppointmentClinic(appointmentId);

      const logs = await repo.findByAppointment(appointmentId);

      // If DOCTOR role, verify it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const appointment = await ctx.prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: { doctor: true },
        });

        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor || appointment?.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: You can only view audit logs for your own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return logs;
    },

    /**
     * Get count of audit logs with filters
     */
    getCount: async (filter?: AuditLogFilterInput) => {
      return repo.count(ctx.clinicId, filter);
    },

    /**
     * Create a new audit log
     * This is typically called internally by other services, but exposed via GraphQL for admin use
     */
    create: async (data: CreateAuditLogInput) => {
      const auditLog = await repo.create({
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        clinic: { connect: { id: ctx.clinicId } },
        actor: ctx.user.id ? { connect: { id: ctx.user.id } } : undefined,
        appointment: data.appointmentId ? { connect: { id: data.appointmentId } } : undefined,
      });

      return auditLog;
    },

    /**
     * Log an action (helper method for internal use)
     * This is the primary method used by other services to create audit logs
     */
    log: async (
      action: string,
      entity: string,
      entityId: string,
      metadata?: any,
      appointmentId?: string
    ) => {
      try {
        const auditLog = await repo.create({
          action,
          entity,
          entityId,
          metadata,
          clinic: { connect: { id: ctx.clinicId } },
          actor: ctx.user?.id ? { connect: { id: ctx.user.id } } : undefined,
          appointment: appointmentId ? { connect: { id: appointmentId } } : undefined,
        });

        return auditLog;
      } catch (error) {
        // Log errors but don't throw - audit logging should never break the main operation
        console.error('Failed to create audit log:', error);
        return null;
      }
    },

    /**
     * Delete a single audit log
     * WARNING: This should be used sparingly and only for compliance reasons
     */
    delete: async (id: string) => {
      await verifyAuditLogClinic(id);

      const deletedLog = await repo.delete(id);

      // Create an audit log about deleting an audit log (meta!)
      await repo.create({
        action: 'auditLog.delete',
        entity: 'AuditLog',
        entityId: id,
        metadata: {
          deletedAction: deletedLog.action,
          deletedEntity: deletedLog.entity,
          deletedEntityId: deletedLog.entityId,
        },
        clinic: { connect: { id: ctx.clinicId } },
        actor: { connect: { id: ctx.user.id } },
      });

      return deletedLog;
    },

    /**
     * Delete audit logs for a specific entity
     * WARNING: Use with caution, typically only for GDPR compliance
     */
    deleteByEntity: async (entity: string, entityId: string) => {
      const count = await repo.count(ctx.clinicId, { entity, entityId });

      const result = await repo.deleteByEntity(ctx.clinicId, entity, entityId);

      // Create an audit log about bulk deletion
      await repo.create({
        action: 'auditLog.bulkDelete',
        entity: 'AuditLog',
        entityId: `${entity}:${entityId}`,
        metadata: {
          deletedCount: count,
          deletedEntity: entity,
          deletedEntityId: entityId,
        },
        clinic: { connect: { id: ctx.clinicId } },
        actor: { connect: { id: ctx.user.id } },
      });

      return result.count;
    },

    /**
     * Archive old audit logs (delete logs older than specified date)
     * Useful for data retention policies
     */
    archiveOldLogs: async (olderThanDays: number = 365) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const count = await repo.count(ctx.clinicId, {
        endDate: cutoffDate,
      });

      const result = await repo.deleteOlderThan(ctx.clinicId, cutoffDate);

      // Log the archival
      await repo.create({
        action: 'auditLog.archive',
        entity: 'AuditLog',
        entityId: 'bulk',
        metadata: {
          deletedCount: count,
          olderThan: cutoffDate.toISOString(),
          retentionDays: olderThanDays,
        },
        clinic: { connect: { id: ctx.clinicId } },
        actor: { connect: { id: ctx.user.id } },
      });

      return result.count;
    },

    /**
     * Get audit log statistics
     */
    getStatistics: async (startDate?: Date, endDate?: Date) => {
      const [byAction, byEntity, byActor] = await Promise.all([
        repo.getStatsByAction(ctx.clinicId, startDate, endDate),
        repo.getStatsByEntity(ctx.clinicId, startDate, endDate),
        repo.getStatsByActor(ctx.clinicId, startDate, endDate),
      ]);

      return {
        byAction,
        byEntity,
        byActor,
      };
    },
  };
};
