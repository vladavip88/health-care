import { appointmentService } from './appointment.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';
import { AppointmentStatus } from '@prisma/client';

export interface AppointmentsArgs {
  filter?: {
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface DoctorAppointmentsArgs {
  doctorId: string;
  filter?: {
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
  };
}

export const appointmentQueries = {
  /**
   * Get all appointments with optional filters
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only), ASSISTANT, PATIENT (own only)
   */
  appointments: async (_: any, { filter }: AppointmentsArgs, ctx: Context) => {
    return appointmentService(ctx as AuthenticatedContext).list(filter);
  },

  /**
   * Get a single appointment by ID
   * Accessible by: CLINIC_ADMIN, DOCTOR (if theirs), ASSISTANT, PATIENT (if theirs)
   */
  appointment: async (_: any, { id }: { id: string }, ctx: Context) => {
    return appointmentService(ctx as AuthenticatedContext).getById(id);
  },

  /**
   * Get appointments for the current patient
   * Accessible by: PATIENT
   */
  myAppointments: async (_: any, { filter }: AppointmentsArgs, ctx: Context) => {
    return appointmentService(ctx as AuthenticatedContext).getMyAppointments(filter);
  },

  /**
   * Get appointments for a specific doctor
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only), ASSISTANT
   */
  doctorAppointments: async (_: any, { doctorId, filter }: DoctorAppointmentsArgs, ctx: Context) => {
    return appointmentService(ctx as AuthenticatedContext).getDoctorAppointments(doctorId, filter);
  },
};
