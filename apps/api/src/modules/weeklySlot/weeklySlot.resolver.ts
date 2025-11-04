import { weeklySlotQueries } from './weeklySlot.queries';
import { weeklySlotMutations } from './weeklySlot.mutations';

export default {
  Query: {
    ...weeklySlotQueries,
  },
  Mutation: {
    ...weeklySlotMutations,
  },
};
