import type { PrismaClient, Clinic, User, Doctor, Assistant, Patient, Appointment, WeeklySlot, Reminder, ReminderRule } from '@prisma/client';
import type DataLoader from 'dataloader';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CLINIC_ADMIN' | 'DOCTOR' | 'ASSISTANT' | 'PATIENT';
  clinicId: string;
  permissions?: string[];
}

export interface Context {
  prisma: PrismaClient;
  user?: AuthUser;
  clinicId?: string;
  loaders: {
    clinic: DataLoader<string, Clinic | null>;
    user: DataLoader<string, User | null>;
    doctor: DataLoader<string, Doctor | null>;
    doctorByUserId: DataLoader<string, Doctor | null>;
    assistant: DataLoader<string, Assistant | null>;
    assistantByUserId: DataLoader<string, Assistant | null>;
    patient: DataLoader<string, Patient | null>;
    patientByUserId: DataLoader<string, Patient | null>;
    appointment: DataLoader<string, Appointment | null>;
    appointmentsByDoctor: DataLoader<string, Appointment[]>;
    appointmentsByPatient: DataLoader<string, Appointment[]>;
    weeklySlot: DataLoader<string, WeeklySlot | null>;
    weeklySlotsByDoctor: DataLoader<string, WeeklySlot[]>;
    reminder: DataLoader<string, Reminder | null>;
    remindersByAppointment: DataLoader<string, Reminder[]>;
    reminderRule: DataLoader<string, ReminderRule | null>;
  };
}
