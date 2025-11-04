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
      select: {
        id: true,
        name: true,
        legalName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        timezone: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionUntil: true,
        website: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const clinicMap = new Map(clinics.map((c) => [c.id, c]));
    return ids.map((id) => clinicMap.get(id) || null);
  });
