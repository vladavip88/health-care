import type { ClinicService } from './clinic.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export interface GetClinicArgs {
  id: string;
}

/**
 * Clinic Queries
 * Read-only GraphQL operations
 */
export function createClinicQueries(service: ClinicService) {
  return {
    /**
     * Get a single clinic by ID
     * Users can only access their own clinic
     */
    clinic: async (_parent: unknown, args: GetClinicArgs, context: Context) => {
      return service.getClinicById(args.id, context as AuthenticatedContext);
    },

    /**
     * Get current user's clinic with statistics
     */
    myClinic: async (_parent: unknown, _args: unknown, context: Context) => {
      return service.getCurrentClinic(context as AuthenticatedContext);
    },

    /**
     * Get clinic statistics
     * Only CLINIC_ADMIN can view
     */
    clinicStats: async (_parent: unknown, _args: unknown, context: Context) => {
      return service.getClinicStats(context as AuthenticatedContext);
    },

    /**
     * Get all clinics (restricted)
     * Returns only the user's clinic for now
     */
    clinics: async (_parent: unknown, _args: unknown, context: Context) => {
      return service.getClinics(context as AuthenticatedContext);
    },
  };
}
