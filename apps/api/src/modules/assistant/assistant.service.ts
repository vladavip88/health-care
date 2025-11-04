import { GraphQLError } from 'graphql';
import { assistantRepository } from './assistant.repository';
import type { Context } from '../../common/context';

interface CreateAssistantInput {
  userId: string;
  title?: string;
  permissions?: string[];
  active?: boolean;
}

interface UpdateAssistantInput {
  title?: string;
  permissions?: string[];
  active?: boolean;
}

export const assistantService = (ctx: Context) => {
  const repo = assistantRepository(ctx.prisma);

  return {
    /**
     * List all assistants in the clinic
     * Only accessible by CLINIC_ADMIN
     */
    list: async () => {
      return repo.findManyByClinic(ctx.clinicId);
    },

    /**
     * Get a single assistant by ID
     * CLINIC_ADMIN can view any assistant
     * ASSISTANT can only view their own profile
     */
    getById: async (id: string) => {
      const assistant = await repo.findById(id);

      if (!assistant) {
        throw new GraphQLError('Assistant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If the user is an ASSISTANT, they can only view their own profile
      if (ctx.user.role === 'ASSISTANT') {
        const requestingAssistant = await repo.findByUserId(ctx.user.id);
        if (!requestingAssistant || requestingAssistant.id !== id) {
          throw new GraphQLError('Forbidden: Assistants can only view their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return assistant;
    },

    /**
     * Get the assistant profile for the currently authenticated user
     * Only accessible by users with ASSISTANT role
     */
    getMyProfile: async () => {
      const assistant = await repo.findByUserId(ctx.user.id);

      if (!assistant) {
        throw new GraphQLError('Assistant profile not found for current user', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Verify tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return assistant;
    },

    /**
     * Create a new assistant
     * Only accessible by CLINIC_ADMIN
     */
    create: async (data: CreateAssistantInput) => {
      // Verify that the user exists and belongs to the same clinic
      const user = await ctx.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (user.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: User belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (user.role !== 'ASSISTANT') {
        throw new GraphQLError('User must have ASSISTANT role', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if assistant profile already exists for this user
      const existingAssistant = await repo.findByUserId(data.userId);
      if (existingAssistant) {
        throw new GraphQLError('Assistant profile already exists for this user', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const assistant = await repo.create({
        title: data.title,
        permissions: data.permissions || [],
        active: data.active ?? true,
        user: { connect: { id: data.userId } },
        clinic: { connect: { id: ctx.clinicId } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'assistant.create',
        entity: 'Assistant',
        entityId: assistant.id,
        metadata: { title: data.title, userId: data.userId, permissions: data.permissions },
      });

      return assistant;
    },

    /**
     * Update an assistant
     * CLINIC_ADMIN can update any assistant in their clinic
     * ASSISTANT can only update their own profile (limited fields)
     */
    update: async (id: string, data: UpdateAssistantInput) => {
      const assistant = await repo.findById(id);

      if (!assistant) {
        throw new GraphQLError('Assistant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If the user is an ASSISTANT, they can only update their own profile
      // and only limited fields (not permissions or active status)
      if (ctx.user.role === 'ASSISTANT') {
        const requestingAssistant = await repo.findByUserId(ctx.user.id);
        if (!requestingAssistant || requestingAssistant.id !== id) {
          throw new GraphQLError('Forbidden: Assistants can only update their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        // Assistants cannot change their own permissions or active status
        if (data.permissions !== undefined || data.active !== undefined) {
          throw new GraphQLError('Forbidden: Assistants cannot modify permissions or active status', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      const updatedAssistant = await repo.update(id, {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.permissions !== undefined && { permissions: data.permissions }),
        ...(data.active !== undefined && { active: data.active }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'assistant.update',
        entity: 'Assistant',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedAssistant;
    },

    /**
     * Delete an assistant
     * Only accessible by CLINIC_ADMIN
     */
    delete: async (id: string) => {
      const assistant = await repo.findById(id);

      if (!assistant) {
        throw new GraphQLError('Assistant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Check if assistant has created appointments
      const appointmentCount = await ctx.prisma.appointment.count({
        where: { createdById: assistant.userId },
      });

      if (appointmentCount > 0) {
        throw new GraphQLError(
          'Cannot delete assistant with created appointments. Consider deactivating instead.',
          {
            extensions: { code: 'CONFLICT', appointmentCount },
          }
        );
      }

      const deletedAssistant = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'assistant.delete',
        entity: 'Assistant',
        entityId: id,
        metadata: { userId: assistant.userId },
      });

      return deletedAssistant;
    },

    /**
     * Deactivate an assistant
     * Only accessible by CLINIC_ADMIN
     */
    deactivate: async (id: string) => {
      const assistant = await repo.findById(id);

      if (!assistant) {
        throw new GraphQLError('Assistant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (!assistant.active) {
        throw new GraphQLError('Assistant is already inactive', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const deactivatedAssistant = await repo.deactivate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'assistant.deactivate',
        entity: 'Assistant',
        entityId: id,
        metadata: { userId: assistant.userId },
      });

      return deactivatedAssistant;
    },

    /**
     * Activate an assistant
     * Only accessible by CLINIC_ADMIN
     */
    activate: async (id: string) => {
      const assistant = await repo.findById(id);

      if (!assistant) {
        throw new GraphQLError('Assistant not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (assistant.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Assistant belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (assistant.active) {
        throw new GraphQLError('Assistant is already active', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const activatedAssistant = await repo.activate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'assistant.activate',
        entity: 'Assistant',
        entityId: id,
        metadata: { userId: assistant.userId },
      });

      return activatedAssistant;
    },
  };
};
