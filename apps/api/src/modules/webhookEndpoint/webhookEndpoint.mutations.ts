import { webhookEndpointService } from './webhookEndpoint.service';
import type { Context } from '../../common/types/context';

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
    return webhookEndpointService(ctx).create(data);
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
    return webhookEndpointService(ctx).update(id, data);
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
    return webhookEndpointService(ctx).delete(id);
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
    return webhookEndpointService(ctx).activate(id);
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
    return webhookEndpointService(ctx).deactivate(id);
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
    return webhookEndpointService(ctx).testWebhook(id);
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
    return webhookEndpointService(ctx).resetFailureCount(id);
  },
};
