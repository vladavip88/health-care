import { patientQueries } from './patient.queries';
import { patientMutations } from './patient.mutations';

export default {
  Query: {
    ...patientQueries,
  },
  Mutation: {
    ...patientMutations,
  },
};
