import { reminderQueries } from './reminder.queries';
import { reminderMutations } from './reminder.mutations';

export default {
  Query: {
    ...reminderQueries,
  },
  Mutation: {
    ...reminderMutations,
  },
};
