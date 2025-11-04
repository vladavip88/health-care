import { assistantQueries } from './assistant.queries';
import { assistantMutations } from './assistant.mutations';

export default {
  Query: {
    ...assistantQueries,
  },
  Mutation: {
    ...assistantMutations,
  },
};
