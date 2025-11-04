import { webhookEndpointService } from './webhookEndpoint.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export const webhookEndpointQueries = {
  /**
   * Get all webhook endpoints for the clinic
   * Accessible by: CLINIC_ADMIN
   */
  webhookEndpoints: async (
    _: any,
    { filter }: { filter?: any },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).getWebhooks(filter);
  },

  /**
   * Get a single webhook endpoint by ID
   * Accessible by: CLINIC_ADMIN
   */
  webhookEndpoint: async (_: any, { id }: { id: string }, ctx: Context) => {
    return webhookEndpointService(ctx as AuthenticatedContext).getById(id);
  },

  /**
   * Get active webhook endpoints for the clinic
   * Accessible by: CLINIC_ADMIN
   */
  activeWebhookEndpoints: async (_: any, __: any, ctx: Context) => {
    return webhookEndpointService(ctx as AuthenticatedContext).getActiveWebhooks();
  },
};
