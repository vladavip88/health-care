import { appointmentService } from './appointment.service';
import type { Context } from '../../common/types/context';
import { AppointmentStatus, AppointmentSource } from '@prisma/client';

export interface CreateAppointmentArgs {
  data: {
    doctorId: string;
    patientId: string;
    start: Date;
    end: Date;
    reason?: string;
    notes?: string;
    status?: AppointmentStatus;
    source?: AppointmentSource;
  };
}

export interface UpdateAppointmentArgs {
  id: string;
  data: {
    start?: Date;
    end?: Date;
    reason?: string;
    notes?: string;
    status?: AppointmentStatus;
  };
}

export interface AppointmentIdArgs {
  id: string;
}

export const appointmentMutations = {
  /**
   * Create a new appointment
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  createAppointment: async (_: any, { data }: CreateAppointmentArgs, ctx: Context) => {
    return appointmentService(ctx).create(data);
  },

  /**
   * Update an appointment
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  updateAppointment: async (_: any, { id, data }: UpdateAppointmentArgs, ctx: Context) => {
    return appointmentService(ctx).update(id, data);
  },

  /**
   * Cancel an appointment
   * Accessible by: CLINIC_ADMIN, ASSISTANT, PATIENT (own only)
   */
  cancelAppointment: async (_: any, { id }: AppointmentIdArgs, ctx: Context) => {
    return appointmentService(ctx).cancel(id);
  },

  /**
   * Confirm an appointment
   * Accessible by: CLINIC_ADMIN, ASSISTANT
   */
  confirmAppointment: async (_: any, { id }: AppointmentIdArgs, ctx: Context) => {
    return appointmentService(ctx).confirm(id);
  },

  /**
   * Complete an appointment
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  completeAppointment: async (_: any, { id }: AppointmentIdArgs, ctx: Context) => {
    return appointmentService(ctx).complete(id);
  },

  /**
   * Mark appointment as no-show
   * Accessible by: CLINIC_ADMIN, ASSISTANT, DOCTOR (own only)
   */
  markNoShow: async (_: any, { id }: AppointmentIdArgs, ctx: Context) => {
    return appointmentService(ctx).markNoShow(id);
  },

  /**
   * Delete an appointment
   * Accessible by: CLINIC_ADMIN
   */
  deleteAppointment: async (_: any, { id }: AppointmentIdArgs, ctx: Context) => {
    return appointmentService(ctx).delete(id);
  },
};
