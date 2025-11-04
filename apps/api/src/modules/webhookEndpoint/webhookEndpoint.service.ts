import { GraphQLError } from 'graphql';
import { webhookEndpointRepository } from './webhookEndpoint.repository';
import type { Context } from '../../common/types/context';
import crypto from 'crypto';

interface CreateWebhookEndpointInput {
  url: string;
  secret: string;
  active?: boolean;
  description?: string;
  events: string[];
}

interface UpdateWebhookEndpointInput {
  url?: string;
  secret?: string;
  active?: boolean;
  description?: string;
  events?: string[];
}

interface WebhookEndpointFilterInput {
  active?: boolean;
  event?: string;
}

// List of valid webhook events
const VALID_EVENTS = [
  'appointment.created',
  'appointment.updated',
  'appointment.confirmed',
  'appointment.cancelled',
  'appointment.completed',
  'appointment.noshow',
  'patient.created',
  'patient.updated',
  'reminder.sent',
  'reminder.failed',
];

export const webhookEndpointService = (ctx: Context) => {
  const repo = webhookEndpointRepository(ctx.prisma);

  // ==================== Validation Methods ====================

  /**
   * Validate URL format
   */
  const validateUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      throw new GraphQLError('Invalid URL format', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Validate webhook events
   */
  const validateEvents = (events: string[]) => {
    if (!events || events.length === 0) {
      throw new GraphQLError('At least one event must be specified', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    const invalidEvents = events.filter((event) => !VALID_EVENTS.includes(event));
    if (invalidEvents.length > 0) {
      throw new GraphQLError(
        `Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${VALID_EVENTS.join(', ')}`,
        {
          extensions: { code: 'BAD_REQUEST' },
        }
      );
    }
  };

  /**
   * Validate secret (must be at least 32 characters)
   */
  const validateSecret = (secret: string) => {
    if (secret.length < 32) {
      throw new GraphQLError('Secret must be at least 32 characters long', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Verify webhook endpoint belongs to current clinic
   */
  const verifyWebhookClinic = async (webhookId: string) => {
    const webhook = await repo.findById(webhookId);

    if (!webhook) {
      throw new GraphQLError('Webhook endpoint not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (webhook.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Webhook endpoint belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return webhook;
  };

  // ==================== Service Methods ====================

  return {
    /**
     * Get all webhook endpoints for the clinic
     */
    getWebhooks: async (filter?: WebhookEndpointFilterInput) => {
      if (filter && (filter.active !== undefined || filter.event)) {
        return repo.findWithFilters(ctx.clinicId, filter);
      }
      return repo.findByClinic(ctx.clinicId);
    },

    /**
     * Get active webhook endpoints for the clinic
     */
    getActiveWebhooks: async () => {
      return repo.findActiveByClinic(ctx.clinicId);
    },

    /**
     * Get a single webhook endpoint by ID
     */
    getById: async (id: string) => {
      return verifyWebhookClinic(id);
    },

    /**
     * Get webhook endpoints for a specific event
     */
    getByEvent: async (event: string) => {
      return repo.findByEvent(ctx.clinicId, event);
    },

    /**
     * Create a new webhook endpoint
     */
    create: async (data: CreateWebhookEndpointInput) => {
      // Validate inputs
      validateUrl(data.url);
      validateEvents(data.events);
      validateSecret(data.secret);

      // Check for exact duplicate
      const exactWebhook = await repo.findExact(ctx.clinicId, data.url);
      if (exactWebhook) {
        throw new GraphQLError('A webhook endpoint with this URL already exists for this clinic', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const webhook = await repo.create({
        url: data.url,
        secret: data.secret,
        active: data.active ?? true,
        description: data.description,
        events: data.events,
        failureCount: 0,
        clinic: { connect: { id: ctx.clinicId } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.create',
        entity: 'WebhookEndpoint',
        entityId: webhook.id,
        metadata: {
          url: data.url,
          events: data.events,
          active: data.active ?? true,
        },
      });

      return webhook;
    },

    /**
     * Update a webhook endpoint
     */
    update: async (id: string, data: UpdateWebhookEndpointInput) => {
      const webhook = await verifyWebhookClinic(id);

      // Validate inputs if provided
      if (data.url !== undefined) {
        validateUrl(data.url);

        // Check for duplicate if changing URL
        if (data.url !== webhook.url) {
          const exactWebhook = await repo.findExact(ctx.clinicId, data.url);
          if (exactWebhook) {
            throw new GraphQLError('A webhook endpoint with this URL already exists for this clinic', {
              extensions: { code: 'CONFLICT' },
            });
          }
        }
      }

      if (data.events !== undefined) {
        validateEvents(data.events);
      }

      if (data.secret !== undefined) {
        validateSecret(data.secret);
      }

      const updatedWebhook = await repo.update(id, {
        ...(data.url !== undefined && { url: data.url }),
        ...(data.secret !== undefined && { secret: data.secret }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.events !== undefined && { events: data.events }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.update',
        entity: 'WebhookEndpoint',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedWebhook;
    },

    /**
     * Delete a webhook endpoint
     */
    delete: async (id: string) => {
      await verifyWebhookClinic(id);

      const deletedWebhook = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.delete',
        entity: 'WebhookEndpoint',
        entityId: id,
        metadata: {
          url: deletedWebhook.url,
          events: deletedWebhook.events,
        },
      });

      return deletedWebhook;
    },

    /**
     * Activate a webhook endpoint
     */
    activate: async (id: string) => {
      const webhook = await verifyWebhookClinic(id);

      if (webhook.active) {
        throw new GraphQLError('Webhook endpoint is already active', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const activatedWebhook = await repo.activate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.activate',
        entity: 'WebhookEndpoint',
        entityId: id,
      });

      return activatedWebhook;
    },

    /**
     * Deactivate a webhook endpoint
     */
    deactivate: async (id: string) => {
      const webhook = await verifyWebhookClinic(id);

      if (!webhook.active) {
        throw new GraphQLError('Webhook endpoint is already inactive', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const deactivatedWebhook = await repo.deactivate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.deactivate',
        entity: 'WebhookEndpoint',
        entityId: id,
      });

      return deactivatedWebhook;
    },

    /**
     * Test a webhook endpoint by sending a test payload
     */
    testWebhook: async (id: string): Promise<boolean> => {
      const webhook = await verifyWebhookClinic(id);

      const testPayload = {
        event: 'test.webhook',
        clinicId: ctx.clinicId,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from your clinic management system',
        },
      };

      try {
        // Create HMAC signature
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');

        // Send webhook request
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': 'test.webhook',
          },
          body: JSON.stringify(testPayload),
        });

        if (!response.ok) {
          throw new Error(`Webhook responded with status ${response.status}`);
        }

        // Record success
        await repo.recordSuccess(id);

        // Audit log
        await ctx.audit?.log({
          clinicId: ctx.clinicId,
          actorId: ctx.user.id,
          action: 'webhookEndpoint.test',
          entity: 'WebhookEndpoint',
          entityId: id,
          metadata: {
            success: true,
            status: response.status,
          },
        });

        return true;
      } catch (error) {
        // Record failure
        await repo.recordFailure(id);

        // Audit log
        await ctx.audit?.log({
          clinicId: ctx.clinicId,
          actorId: ctx.user.id,
          action: 'webhookEndpoint.test',
          entity: 'WebhookEndpoint',
          entityId: id,
          metadata: {
            success: false,
            error: error.message,
          },
        });

        throw new GraphQLError(`Webhook test failed: ${error.message}`, {
          extensions: { code: 'WEBHOOK_TEST_FAILED' },
        });
      }
    },

    /**
     * Reset failure count for a webhook endpoint
     */
    resetFailureCount: async (id: string) => {
      await verifyWebhookClinic(id);

      const webhook = await repo.resetFailureCount(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'webhookEndpoint.resetFailureCount',
        entity: 'WebhookEndpoint',
        entityId: id,
      });

      return webhook;
    },

    /**
     * Trigger a webhook for a specific event
     * This method is called internally by other services
     */
    triggerWebhook: async (event: string, data: any) => {
      // Get all active webhooks for this event
      const webhooks = await repo.findByEvent(ctx.clinicId, event);

      if (webhooks.length === 0) {
        return; // No webhooks to trigger
      }

      const payload = {
        event,
        clinicId: ctx.clinicId,
        timestamp: new Date().toISOString(),
        data,
      };

      // Trigger all webhooks in parallel
      const promises = webhooks.map(async (webhook) => {
        try {
          // Create HMAC signature
          const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(payload))
            .digest('hex');

          // Send webhook request
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'X-Webhook-Event': event,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            await repo.recordSuccess(webhook.id);
          } else {
            await repo.recordFailure(webhook.id);
          }
        } catch (error) {
          await repo.recordFailure(webhook.id);
        }
      });

      await Promise.allSettled(promises);
    },
  };
};
