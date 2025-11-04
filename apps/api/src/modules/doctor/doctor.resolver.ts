import { doctorQueries } from './doctor.queries';
import { doctorMutations } from './doctor.mutations';

export default {
  Query: {
    ...doctorQueries,
  },
  Mutation: {
    ...doctorMutations,
  },
};
