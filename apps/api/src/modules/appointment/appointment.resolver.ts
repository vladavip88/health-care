import { appointmentQueries } from './appointment.queries';
import { appointmentMutations } from './appointment.mutations';

export default {
  Query: {
    ...appointmentQueries,
  },
  Mutation: {
    ...appointmentMutations,
  },
};
