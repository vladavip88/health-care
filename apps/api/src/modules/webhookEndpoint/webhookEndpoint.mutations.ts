import { webhookEndpointService } from './webhookEndpoint.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export const webhookEndpointMutations = {
  /**
   * Create a new webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  createWebhookEndpoint: async (
    _: any,
    { data }: { data: any },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).create(data);
  },

  /**
   * Update a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  updateWebhookEndpoint: async (
    _: any,
    { id, data }: { id: string; data: any },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).update(id, data);
  },

  /**
   * Delete a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  deleteWebhookEndpoint: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).delete(id);
  },

  /**
   * Activate a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  activateWebhookEndpoint: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).activate(id);
  },

  /**
   * Deactivate a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  deactivateWebhookEndpoint: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).deactivate(id);
  },

  /**
   * Test a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  testWebhookEndpoint: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).testWebhook(id);
  },

  /**
   * Reset failure count for a webhook endpoint
   * Accessible by: CLINIC_ADMIN
   */
  resetWebhookFailureCount: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ) => {
    return webhookEndpointService(ctx as AuthenticatedContext).resetFailureCount(id);
  },
};
