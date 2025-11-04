import { auditLogService } from './auditLog.service';
import type { Context } from '../../common/context';

export const auditLogMutations = {
  /**
   * Create a new audit log
   * Accessible by: CLINIC_ADMIN
   * Note: This is primarily for manual audit log creation. Most audit logs are created automatically by other services.
   */
  createAuditLog: async (_: any, { data }: { data: any }, ctx: Context) => {
    return auditLogService(ctx).create(data);
  },

  /**
   * Delete a single audit log
   * Accessible by: CLINIC_ADMIN
   * WARNING: Use with caution. Deleting audit logs should only be done for compliance reasons (e.g., GDPR).
   */
  deleteAuditLog: async (_: any, { id }: { id: string }, ctx: Context) => {
    return auditLogService(ctx).delete(id);
  },

  /**
   * Delete audit logs for a specific entity
   * Accessible by: CLINIC_ADMIN
   * WARNING: Use with caution. This is typically used for GDPR compliance when deleting user data.
   */
  deleteAuditLogsByEntity: async (
    _: any,
    { entity, entityId }: { entity: string; entityId: string },
    ctx: Context
  ) => {
    return auditLogService(ctx).deleteByEntity(entity, entityId);
  },
};
