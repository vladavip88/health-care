import { doctorService } from './doctor.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export const doctorQueries = {
  /**
   * Get all doctors in the clinic
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  doctors: async (_: any, __: any, ctx: Context) => {
    return doctorService(ctx as AuthenticatedContext).list();
  },

  /**
   * Get a single doctor by ID
   * Accessible by: CLINIC_ADMIN, ASSISTANT, DOCTOR (own profile only)
   */
  doctor: async (_: any, { id }: { id: string }, ctx: Context) => {
    return doctorService(ctx as AuthenticatedContext).getById(id);
  },

  /**
   * Get the doctor profile for the currently authenticated user
   * Accessible by: DOCTOR
   */
  myDoctorProfile: async (_: any, __: any, ctx: Context) => {
    return doctorService(ctx as AuthenticatedContext).getMyProfile();
  },
};
