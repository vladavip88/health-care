import { webhookEndpointQueries } from './webhookEndpoint.queries';
import { webhookEndpointMutations } from './webhookEndpoint.mutations';

export default {
  Query: {
    ...webhookEndpointQueries,
  },
  Mutation: {
    ...webhookEndpointMutations,
  },
};
