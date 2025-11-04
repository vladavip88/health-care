import { auditLogService } from './auditLog.service';
import type { Context } from '../../common/types/context';

export const auditLogQueries = {
  /**
   * Get audit logs with filters and pagination
   * Accessible by: CLINIC_ADMIN
   */
  auditLogs: async (
    _: any,
    { filter, limit, offset }: { filter?: any; limit?: number; offset?: number },
    ctx: Context
  ) => {
    return auditLogService(ctx).getAuditLogs(filter, limit, offset);
  },

  /**
   * Get a single audit log by ID
   * Accessible by: CLINIC_ADMIN
   */
  auditLog: async (_: any, { id }: { id: string }, ctx: Context) => {
    return auditLogService(ctx).getById(id);
  },

  /**
   * Get audit logs for a specific entity
   * Accessible by: CLINIC_ADMIN
   */
  auditLogsByEntity: async (
    _: any,
    { entity, entityId }: { entity: string; entityId: string },
    ctx: Context
  ) => {
    return auditLogService(ctx).getByEntity(entity, entityId);
  },

  /**
   * Get audit logs for a specific actor
   * Accessible by: CLINIC_ADMIN
   */
  auditLogsByActor: async (
    _: any,
    { actorId, limit, offset }: { actorId: string; limit?: number; offset?: number },
    ctx: Context
  ) => {
    return auditLogService(ctx).getByActor(actorId, limit, offset);
  },

  /**
   * Get audit logs for a specific appointment
   * Accessible by: CLINIC_ADMIN, DOCTOR (own appointments), ASSISTANT
   */
  auditLogsByAppointment: async (
    _: any,
    { appointmentId }: { appointmentId: string },
    ctx: Context
  ) => {
    return auditLogService(ctx).getByAppointment(appointmentId);
  },

  /**
   * Get count of audit logs with filters
   * Accessible by: CLINIC_ADMIN
   */
  auditLogsCount: async (_: any, { filter }: { filter?: any }, ctx: Context) => {
    return auditLogService(ctx).getCount(filter);
  },
};
