import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Patient DataLoader
 * Batches and caches patient lookups by ID
 * Nested relations (user, clinic) are resolved by their respective DataLoaders
 */
export const createPatientLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const patients = await prisma.patient.findMany({
      where: { id: { in: ids as string[] } },
    });

    const patientMap = new Map(patients.map((p) => [p.id, p]));
    return ids.map((id) => patientMap.get(id) || null);
  });

/**
 * Patient By User ID DataLoader
 * Batches and caches patient lookups by userId (1:1 optional relationship)
 * Nested relations (user, clinic) are resolved by their respective DataLoaders
 */
export const createPatientByUserIdLoader = (prisma: PrismaClient) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const patients = await prisma.patient.findMany({
      where: { userId: { in: userIds as string[] } },
    });

    const patientMap = new Map(patients.map((p) => [p.userId!, p]));
    return userIds.map((userId) => patientMap.get(userId) || null);
  });
