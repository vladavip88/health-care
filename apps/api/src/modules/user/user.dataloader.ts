import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * User DataLoader
 * Batches and caches user lookups by ID
 */
export const createUserLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        active: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        clinicId: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id) || null);
  });
