import { GraphQLError } from 'graphql';
import type { Clinic } from '@prisma/client';
import type { ClinicRepository, ClinicFilters, CreateClinicData } from './clinic.repository';
import type { AuthenticatedContext, Context } from '../../common/types/context';
import { PERMISSIONS } from '../../common/auth/permissions';

export interface CreateClinicInput {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionUntil?: Date;
  website?: string;
  logoUrl?: string;
}

export interface UpdateClinicInput {
  id: string;
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  website?: string;
  logoUrl?: string;
}

export interface UpdateSubscriptionInput {
  id: string;
  plan: string;
  status: string;
  until?: Date;
}

/**
 * Clinic Service Layer
 * Contains business logic, RBAC enforcement, and multi-tenancy validation
 */
export function createClinicService(repository: ClinicRepository) {
  return {
    /**
     * Get clinic by ID
     * Users can only access their own clinic
     */
    async getClinicById(id: string, context: AuthenticatedContext): Promise<Clinic | null> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Users can only access their own clinic
      if (id !== context.clinicId) {
        throw new GraphQLError('Forbidden: Cannot access other clinics', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return repository.findById(id);
    },

    /**
     * Get current user's clinic
     * Returns clinic with statistics
     */
    async getCurrentClinic(context: AuthenticatedContext) {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const clinic = await repository.findByIdWithRelations(context.clinicId);
      if (!clinic) {
        throw new GraphQLError('Clinic not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return clinic;
    },

    /**
     * Get clinic statistics
     * Only CLINIC_ADMIN can view stats
     */
    async getClinicStats(context: AuthenticatedContext) {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.CLINIC_READ)) {
        throw new GraphQLError('Forbidden: Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return repository.getStats(context.clinicId);
    },

    /**
     * Get all clinics (SUPER_ADMIN only - not implemented in RBAC yet)
     * This would be used by platform administrators
     */
    async getClinics(context: AuthenticatedContext, filters?: ClinicFilters): Promise<Clinic[]> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // For now, only allow CLINIC_ADMIN to list clinics (returns only their clinic)
      if (!context.user.permissions?.includes(PERMISSIONS.CLINIC_READ)) {
        throw new GraphQLError('Forbidden: Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Users can only see their own clinic
      const clinic = await repository.findById(context.clinicId);
      return clinic ? [clinic] : [];
    },

    /**
     * Create a new clinic
     * This would typically be done during registration/onboarding
     * For now, restricted to prevent unauthorized clinic creation
     */
    async createClinic(input: CreateClinicInput, context: Context): Promise<Clinic> {
      // Allow clinic creation during onboarding (no auth required)
      const clinicData: CreateClinicData = { ...input };
      return repository.create(clinicData);
    },

    /**
     * Update clinic settings
     * Only CLINIC_ADMIN can update their own clinic
     */
    async updateClinic(input: UpdateClinicInput, context: AuthenticatedContext): Promise<Clinic> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.CLINIC_UPDATE)) {
        throw new GraphQLError('Forbidden: Insufficient permissions to update clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Tenancy check: can only update own clinic
      if (input.id !== context.clinicId) {
        throw new GraphQLError('Forbidden: Cannot update other clinics', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const existingClinic = await repository.findById(input.id);
      if (!existingClinic) {
        throw new GraphQLError('Clinic not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const { id, ...updateData } = input;
      const updatedClinic = await repository.update(id, updateData);

      // Audit log
      await context.audit?.log({
        clinicId: context.clinicId,
        actorId: context.user.id,
        action: 'clinic.update',
        entity: 'Clinic',
        entityId: id,
        metadata: {
          name: existingClinic.name,
          changes: updateData,
        },
      });

      return updatedClinic;
    },

    /**
     * Update clinic subscription
     * Only CLINIC_ADMIN can update subscription
     */
    async updateSubscription(input: UpdateSubscriptionInput, context: AuthenticatedContext): Promise<Clinic> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.CLINIC_SETTINGS)) {
        throw new GraphQLError('Forbidden: Insufficient permissions to update subscription', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Tenancy check
      if (input.id !== context.clinicId) {
        throw new GraphQLError('Forbidden: Cannot update other clinic subscriptions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const existingClinic = await repository.findById(input.id);
      if (!existingClinic) {
        throw new GraphQLError('Clinic not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updatedClinic = await repository.updateSubscription(input.id, input.plan, input.status, input.until);

      // Audit log
      await context.audit?.log({
        clinicId: context.clinicId,
        actorId: context.user.id,
        action: 'clinic.updateSubscription',
        entity: 'Clinic',
        entityId: input.id,
        metadata: {
          name: existingClinic.name,
          newPlan: input.plan,
          newStatus: input.status,
          newUntil: input.until,
        },
      });

      return updatedClinic;
    },

    /**
     * Delete clinic
     * Restricted - clinics should rarely be deleted
     */
    async deleteClinic(id: string, context: AuthenticatedContext): Promise<Clinic> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Only platform admins should delete clinics
      throw new GraphQLError('Forbidden: Clinic deletion is restricted', {
        extensions: { code: 'FORBIDDEN' },
      });
    },
  };
}

export type ClinicService = ReturnType<typeof createClinicService>;
