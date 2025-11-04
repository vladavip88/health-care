import { GraphQLError } from 'graphql';
import { AppointmentStatus, AppointmentSource } from '@prisma/client';
import { appointmentRepository } from './appointment.repository';
import type { Context } from '../../common/types/context';

interface CreateAppointmentInput {
  doctorId: string;
  patientId: string;
  start: Date;
  end: Date;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
  source?: AppointmentSource;
}

interface UpdateAppointmentInput {
  start?: Date;
  end?: Date;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

interface AppointmentFilterInput {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export const appointmentService = (ctx: Context) => {
  const repo = appointmentRepository(ctx.prisma);

  return {
    /**
     * List appointments with optional filters
     * CLINIC_ADMIN and ASSISTANT can see all appointments
     * DOCTOR can only see their own appointments
     * PATIENT can only see their own appointments
     */
    list: async (filter?: AppointmentFilterInput) => {
      // If user is a DOCTOR, only show their appointments
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor) {
          throw new GraphQLError('Doctor profile not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return repo.findByDoctor(doctor.id, ctx.clinicId, filter?.startDate, filter?.endDate);
      }

      // If user is a PATIENT, only show their appointments
      if (ctx.user.role === 'PATIENT') {
        const patient = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!patient) {
          throw new GraphQLError('Patient profile not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return repo.findByPatient(patient.id, ctx.clinicId, filter?.startDate, filter?.endDate);
      }

      // Filter by doctor
      if (filter?.doctorId) {
        return repo.findByDoctor(filter.doctorId, ctx.clinicId, filter.startDate, filter.endDate);
      }

      // Filter by patient
      if (filter?.patientId) {
        return repo.findByPatient(filter.patientId, ctx.clinicId, filter.startDate, filter.endDate);
      }

      // Filter by status
      if (filter?.status) {
        return repo.findByStatus(ctx.clinicId, filter.status);
      }

      // Filter by date range
      if (filter?.startDate && filter?.endDate) {
        return repo.findByDateRange(ctx.clinicId, filter.startDate, filter.endDate);
      }

      // Return all appointments
      return repo.findManyByClinic(ctx.clinicId);
    },

    /**
     * Get a single appointment by ID
     * Access control based on role
     */
    getById: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a DOCTOR, check if it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor || appointment.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: Doctors can only view their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      // If user is a PATIENT, check if it's their appointment
      if (ctx.user.role === 'PATIENT') {
        const patient = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!patient || appointment.patientId !== patient.id) {
          throw new GraphQLError('Forbidden: Patients can only view their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return appointment;
    },

    /**
     * Get appointments for the current patient
     */
    getMyAppointments: async (filter?: AppointmentFilterInput) => {
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!patient) {
        throw new GraphQLError('Patient profile not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return repo.findByPatient(patient.id, ctx.clinicId, filter?.startDate, filter?.endDate);
    },

    /**
     * Get appointments for a specific doctor
     */
    getDoctorAppointments: async (doctorId: string, filter?: AppointmentFilterInput) => {
      // Verify doctor belongs to clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        throw new GraphQLError('Doctor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a DOCTOR, they can only see their own appointments
      if (ctx.user.role === 'DOCTOR') {
        const requestingDoctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!requestingDoctor || requestingDoctor.id !== doctorId) {
          throw new GraphQLError('Forbidden: Doctors can only view their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return repo.findByDoctor(doctorId, ctx.clinicId, filter?.startDate, filter?.endDate);
    },

    /**
     * Create a new appointment
     * Only CLINIC_ADMIN and ASSISTANT can create appointments
     */
    create: async (data: CreateAppointmentInput) => {
      // Verify doctor exists and belongs to clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: data.doctorId },
      });

      if (!doctor) {
        throw new GraphQLError('Doctor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify patient exists and belongs to clinic
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: data.patientId },
      });

      if (!patient) {
        throw new GraphQLError('Patient not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (patient.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Patient belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Validate appointment times
      if (data.start >= data.end) {
        throw new GraphQLError('Appointment end time must be after start time', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if appointment is in the past
      if (data.start < new Date()) {
        throw new GraphQLError('Cannot create appointments in the past', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check for overlapping appointments
      const overlapping = await repo.findOverlapping(data.doctorId, data.start, data.end);

      if (overlapping) {
        throw new GraphQLError('Doctor already has an appointment at this time', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const appointment = await repo.create({
        start: data.start,
        end: data.end,
        reason: data.reason,
        notes: data.notes,
        status: data.status || 'PENDING',
        source: data.source || 'ADMIN_PORTAL',
        clinic: { connect: { id: ctx.clinicId } },
        doctor: { connect: { id: data.doctorId } },
        patient: { connect: { id: data.patientId } },
        createdBy: { connect: { id: ctx.user.id } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.create',
        entity: 'Appointment',
        entityId: appointment.id,
        appointmentId: appointment.id,
        metadata: {
          doctorId: data.doctorId,
          patientId: data.patientId,
          start: data.start,
          end: data.end,
        },
      });

      return appointment;
    },

    /**
     * Update an appointment
     * Only CLINIC_ADMIN and ASSISTANT can update appointments
     */
    update: async (id: string, data: UpdateAppointmentInput) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Validate appointment times if being updated
      if (data.start && data.end && data.start >= data.end) {
        throw new GraphQLError('Appointment end time must be after start time', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check for overlapping appointments if time is being changed
      if (data.start || data.end) {
        const newStart = data.start || appointment.start;
        const newEnd = data.end || appointment.end;

        const overlapping = await repo.findOverlapping(appointment.doctorId, newStart, newEnd, id);

        if (overlapping) {
          throw new GraphQLError('Doctor already has an appointment at this time', {
            extensions: { code: 'CONFLICT' },
          });
        }
      }

      const updatedAppointment = await repo.update(id, {
        ...(data.start !== undefined && { start: data.start }),
        ...(data.end !== undefined && { end: data.end }),
        ...(data.reason !== undefined && { reason: data.reason }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.update',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: { changes: data },
      });

      return updatedAppointment;
    },

    /**
     * Cancel an appointment
     * CLINIC_ADMIN, ASSISTANT, and PATIENT can cancel
     */
    cancel: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a PATIENT, verify it's their appointment
      if (ctx.user.role === 'PATIENT') {
        const patient = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!patient || appointment.patientId !== patient.id) {
          throw new GraphQLError('Forbidden: Patients can only cancel their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      // Check if already cancelled
      if (appointment.status === 'CANCELLED') {
        throw new GraphQLError('Appointment is already cancelled', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const cancelledAppointment = await repo.updateStatus(id, 'CANCELLED');

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.cancel',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: { previousStatus: appointment.status },
      });

      return cancelledAppointment;
    },

    /**
     * Confirm an appointment
     * Only CLINIC_ADMIN and ASSISTANT can confirm
     */
    confirm: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const confirmedAppointment = await repo.updateStatus(id, 'CONFIRMED');

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.confirm',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: { previousStatus: appointment.status },
      });

      return confirmedAppointment;
    },

    /**
     * Complete an appointment
     * Only CLINIC_ADMIN and DOCTOR can complete
     */
    complete: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a DOCTOR, verify it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor || appointment.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: Doctors can only complete their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      const completedAppointment = await repo.updateStatus(id, 'COMPLETED');

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.complete',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: { previousStatus: appointment.status },
      });

      return completedAppointment;
    },

    /**
     * Mark appointment as no-show
     * CLINIC_ADMIN, ASSISTANT, and DOCTOR can mark no-show
     */
    markNoShow: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a DOCTOR, verify it's their appointment
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor || appointment.doctorId !== doctor.id) {
          throw new GraphQLError('Forbidden: Doctors can only mark their own appointments', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      const noShowAppointment = await repo.updateStatus(id, 'NOSHOW');

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.noshow',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: { previousStatus: appointment.status },
      });

      return noShowAppointment;
    },

    /**
     * Delete an appointment
     * Only CLINIC_ADMIN can delete
     */
    delete: async (id: string) => {
      const appointment = await repo.findById(id);

      if (!appointment) {
        throw new GraphQLError('Appointment not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (appointment.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Appointment belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const deletedAppointment = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'appointment.delete',
        entity: 'Appointment',
        entityId: id,
        appointmentId: id,
        metadata: {
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          start: appointment.start,
          end: appointment.end,
          status: appointment.status,
        },
      });

      return deletedAppointment;
    },
  };
};
