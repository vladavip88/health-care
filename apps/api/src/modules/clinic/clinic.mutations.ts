import type { ClinicService, CreateClinicInput, UpdateClinicInput, UpdateSubscriptionInput } from './clinic.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

/**
 * Clinic Mutations
 * Write GraphQL operations
 */
export function createClinicMutations(service: ClinicService) {
  return {
    /**
     * Create a new clinic (restricted)
     */
    createClinic: async (_parent: unknown, args: CreateClinicInput, context: Context) => {
      return service.createClinic(args, context as AuthenticatedContext);
    },

    /**
     * Update clinic settings
     * Only CLINIC_ADMIN can update
     */
    updateClinic: async (_parent: unknown, args: UpdateClinicInput, context: Context) => {
      return service.updateClinic(args, context as AuthenticatedContext);
    },

    /**
     * Update clinic subscription
     * Only CLINIC_ADMIN can update
     */
    updateClinicSubscription: async (_parent: unknown, args: UpdateSubscriptionInput, context: Context) => {
      return service.updateSubscription(args, context as AuthenticatedContext);
    },

    /**
     * Delete clinic (restricted)
     */
    deleteClinic: async (_parent: unknown, args: { id: string }, context: Context) => {
      return service.deleteClinic(args.id, context as AuthenticatedContext);
    },
  };
}
