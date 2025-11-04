import { webhookEndpointQueries } from './webhookEndpoint.queries';
import { webhookEndpointMutations } from './webhookEndpoint.mutations';

export const webhookEndpointResolver = {
  Query: {
    ...webhookEndpointQueries,
  },
  Mutation: {
    ...webhookEndpointMutations,
  },
};
