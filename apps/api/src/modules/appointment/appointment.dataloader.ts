import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Appointment DataLoader
 * Batches and caches appointment lookups by ID
 * Nested relations (clinic, doctor, patient, createdBy) are resolved by their respective DataLoaders
 */
export const createAppointmentLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const appointments = await prisma.appointment.findMany({
      where: { id: { in: ids as string[] } },
    });

    const appointmentMap = new Map(appointments.map((a) => [a.id, a]));
    return ids.map((id) => appointmentMap.get(id) || null);
  });

/**
 * Appointments By Doctor DataLoader
 * Batches and caches appointment lists by doctorId
 * Useful for resolving doctor.appointments field
 * Nested relations (patient) are resolved by their respective DataLoaders
 */
export const createAppointmentsByDoctorLoader = (prisma: PrismaClient) =>
  new DataLoader(async (doctorIds: readonly string[]) => {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: { in: doctorIds as string[] } },
      orderBy: { start: 'asc' },
    });

    // Group appointments by doctorId
    const appointmentsByDoctor = new Map<string, typeof appointments>();
    doctorIds.forEach((doctorId) => {
      appointmentsByDoctor.set(doctorId, []);
    });

    appointments.forEach((appointment) => {
      const existing = appointmentsByDoctor.get(appointment.doctorId) || [];
      appointmentsByDoctor.set(appointment.doctorId, [...existing, appointment]);
    });

    return doctorIds.map((doctorId) => appointmentsByDoctor.get(doctorId) || []);
  });

/**
 * Appointments By Patient DataLoader
 * Batches and caches appointment lists by patientId
 * Useful for resolving patient.appointments field
 * Nested relations (doctor) are resolved by their respective DataLoaders
 */
export const createAppointmentsByPatientLoader = (prisma: PrismaClient) =>
  new DataLoader(async (patientIds: readonly string[]) => {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: { in: patientIds as string[] } },
      orderBy: { start: 'asc' },
    });

    // Group appointments by patientId
    const appointmentsByPatient = new Map<string, typeof appointments>();
    patientIds.forEach((patientId) => {
      appointmentsByPatient.set(patientId, []);
    });

    appointments.forEach((appointment) => {
      const existing = appointmentsByPatient.get(appointment.patientId) || [];
      appointmentsByPatient.set(appointment.patientId, [...existing, appointment]);
    });

    return patientIds.map((patientId) => appointmentsByPatient.get(patientId) || []);
  });
