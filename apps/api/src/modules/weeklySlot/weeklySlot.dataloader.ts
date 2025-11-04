import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * WeeklySlot DataLoader
 * Batches and caches weekly slot lookups by ID
 * Nested relations (doctor) are resolved by their respective DataLoaders
 */
export const createWeeklySlotLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const slots = await prisma.weeklySlot.findMany({
      where: { id: { in: ids as string[] } },
    });

    const slotMap = new Map(slots.map((s) => [s.id, s]));
    return ids.map((id) => slotMap.get(id) || null);
  });

/**
 * WeeklySlots By Doctor DataLoader
 * Batches and caches weekly slot lists by doctorId
 * Useful for resolving doctor.slots field
 */
export const createWeeklySlotsByDoctorLoader = (prisma: PrismaClient) =>
  new DataLoader(async (doctorIds: readonly string[]) => {
    const slots = await prisma.weeklySlot.findMany({
      where: { doctorId: { in: doctorIds as string[] } },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });

    // Group slots by doctorId
    const slotsByDoctor = new Map<string, typeof slots>();
    doctorIds.forEach((doctorId) => {
      slotsByDoctor.set(doctorId, []);
    });

    slots.forEach((slot) => {
      const existing = slotsByDoctor.get(slot.doctorId) || [];
      slotsByDoctor.set(slot.doctorId, [...existing, slot]);
    });

    return doctorIds.map((doctorId) => slotsByDoctor.get(doctorId) || []);
  });
