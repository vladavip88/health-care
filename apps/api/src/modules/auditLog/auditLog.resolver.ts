import { auditLogQueries } from './auditLog.queries';
import { auditLogMutations } from './auditLog.mutations';

export const auditLogResolver = {
  Query: {
    ...auditLogQueries,
  },
  Mutation: {
    ...auditLogMutations,
  },
};
