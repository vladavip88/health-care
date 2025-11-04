import { doctorService } from './doctor.service';
import type { Context } from '../../common/context';

interface CreateDoctorArgs {
  data: {
    userId: string;
    specialty?: string;
    title?: string;
    bio?: string;
    avatarUrl?: string;
    languages?: string[];
    gcalCalendarId?: string;
    isAcceptingNewPatients?: boolean;
    timezone?: string;
  };
}

interface UpdateDoctorArgs {
  id: string;
  data: {
    specialty?: string;
    title?: string;
    bio?: string;
    avatarUrl?: string;
    languages?: string[];
    gcalCalendarId?: string;
    isAcceptingNewPatients?: boolean;
    timezone?: string;
  };
}

interface DeleteDoctorArgs {
  id: string;
}

export const doctorMutations = {
  /**
   * Create a new doctor
   * Accessible by: CLINIC_ADMIN
   */
  createDoctor: async (_: any, { data }: CreateDoctorArgs, ctx: Context) => {
    return doctorService(ctx).create(data);
  },

  /**
   * Update a doctor
   * Accessible by: CLINIC_ADMIN (any doctor), DOCTOR (own profile only)
   */
  updateDoctor: async (_: any, { id, data }: UpdateDoctorArgs, ctx: Context) => {
    return doctorService(ctx).update(id, data);
  },

  /**
   * Delete a doctor
   * Accessible by: CLINIC_ADMIN
   */
  deleteDoctor: async (_: any, { id }: DeleteDoctorArgs, ctx: Context) => {
    return doctorService(ctx).delete(id);
  },
};
