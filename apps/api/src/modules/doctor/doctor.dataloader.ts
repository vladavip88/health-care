import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Doctor DataLoader
 * Batches and caches doctor lookups by ID
 * Nested relations (user, clinic) are resolved by their respective DataLoaders
 */
export const createDoctorLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const doctors = await prisma.doctor.findMany({
      where: { id: { in: ids as string[] } },
    });

    const doctorMap = new Map(doctors.map((d) => [d.id, d]));
    return ids.map((id) => doctorMap.get(id) || null);
  });

/**
 * Doctor By User ID DataLoader
 * Batches and caches doctor lookups by userId (1:1 relationship)
 * Nested relations (user, clinic) are resolved by their respective DataLoaders
 */
export const createDoctorByUserIdLoader = (prisma: PrismaClient) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const doctors = await prisma.doctor.findMany({
      where: { userId: { in: userIds as string[] } },
    });

    const doctorMap = new Map(doctors.map((d) => [d.userId, d]));
    return userIds.map((userId) => doctorMap.get(userId) || null);
  });
