import { patientService } from './patient.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export interface PatientsArgs {
  search?: {
    query?: string;
    email?: string;
    phone?: string;
  };
}

export const patientQueries = {
  /**
   * Get all patients in the clinic or search
   * Accessible by: CLINIC_ADMIN, DOCTOR (own patients only), ASSISTANT
   */
  patients: async (_: any, { search }: PatientsArgs, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).list(search);
  },

  /**
   * Get a single patient by ID
   * Accessible by: CLINIC_ADMIN, DOCTOR (if has appointments with patient), ASSISTANT, PATIENT (own profile only)
   */
  patient: async (_: any, { id }: { id: string }, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).getById(id);
  },

  /**
   * Get the patient profile for the currently authenticated user
   * Accessible by: PATIENT
   */
  myPatientProfile: async (_: any, __: any, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).getMyProfile();
  },
};
