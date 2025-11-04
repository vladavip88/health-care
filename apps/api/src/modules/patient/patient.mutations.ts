import { patientService } from './patient.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export interface CreatePatientArgs {
  data: {
    userId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dob?: Date;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
  };
}

export interface UpdatePatientArgs {
  id: string;
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dob?: Date;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
  };
}

export interface DeletePatientArgs {
  id: string;
}

export const patientMutations = {
  /**
   * Create a new patient
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  createPatient: async (_: any, { data }: CreatePatientArgs, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).create(data);
  },

  /**
   * Update a patient
   * Accessible by: CLINIC_ADMIN, ASSISTANT (any patient), PATIENT (own profile only, limited fields)
   */
  updatePatient: async (_: any, { id, data }: UpdatePatientArgs, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).update(id, data);
  },

  /**
   * Delete a patient
   * Accessible by: CLINIC_ADMIN
   */
  deletePatient: async (_: any, { id }: DeletePatientArgs, ctx: Context) => {
    return patientService(ctx as AuthenticatedContext).delete(id);
  },
};
