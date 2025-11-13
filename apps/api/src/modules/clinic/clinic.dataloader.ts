import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Clinic DataLoader
 * Batches and caches clinic lookups by ID
 */
export const createClinicLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const clinics = await prisma.clinic.findMany({
      where: { id: { in: ids as string[] } },
    });

    const clinicMap = new Map(clinics.map((c) => [c.id, c]));
    return ids.map((id) => clinicMap.get(id) || null);
  });
