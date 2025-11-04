import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Reminder DataLoader
 * Batches and caches reminder lookups by ID
 * Nested relations (appointment, rule) are resolved by their respective DataLoaders
 */
export const createReminderLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const reminders = await prisma.reminder.findMany({
      where: { id: { in: ids as string[] } },
    });

    const reminderMap = new Map(reminders.map((r) => [r.id, r]));
    return ids.map((id) => reminderMap.get(id) || null);
  });

/**
 * Reminders By Appointment DataLoader
 * Batches and caches reminder lists by appointmentId
 * Useful for resolving appointment.reminders field
 * Nested relations (rule) are resolved by their respective DataLoaders
 */
export const createRemindersByAppointmentLoader = (prisma: PrismaClient) =>
  new DataLoader(async (appointmentIds: readonly string[]) => {
    const reminders = await prisma.reminder.findMany({
      where: { appointmentId: { in: appointmentIds as string[] } },
      orderBy: { scheduledFor: 'asc' },
    });

    // Group reminders by appointmentId
    const remindersByAppointment = new Map<string, typeof reminders>();
    appointmentIds.forEach((appointmentId) => {
      remindersByAppointment.set(appointmentId, []);
    });

    reminders.forEach((reminder) => {
      const existing = remindersByAppointment.get(reminder.appointmentId) || [];
      remindersByAppointment.set(reminder.appointmentId, [...existing, reminder]);
    });

    return appointmentIds.map((appointmentId) => remindersByAppointment.get(appointmentId) || []);
  });

/**
 * ReminderRule DataLoader
 * Batches and caches reminder rule lookups by ID
 * Nested relations (clinic) are resolved by their respective DataLoaders
 */
export const createReminderRuleLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const rules = await prisma.reminderRule.findMany({
      where: { id: { in: ids as string[] } },
    });

    const ruleMap = new Map(rules.map((r) => [r.id, r]));
    return ids.map((id) => ruleMap.get(id) || null);
  });
