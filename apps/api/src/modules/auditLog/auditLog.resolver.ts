import { auditLogQueries } from './auditLog.queries';
import { auditLogMutations } from './auditLog.mutations';

export default {
  Query: {
    ...auditLogQueries,
  },
  Mutation: {
    ...auditLogMutations,
  },
};
