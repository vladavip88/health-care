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
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id) || null);
  });
