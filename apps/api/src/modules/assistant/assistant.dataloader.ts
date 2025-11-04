import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

/**
 * Assistant DataLoader
 * Batches and caches assistant lookups by ID
 */
export const createAssistantLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const assistants = await prisma.assistant.findMany({
      where: { id: { in: ids as string[] } },
    });

    const assistantMap = new Map(assistants.map((a) => [a.id, a]));
    return ids.map((id) => assistantMap.get(id) || null);
  });

/**
 * Assistant By User ID DataLoader
 * Batches and caches assistant lookups by userId (1:1 relationship)
 */
export const createAssistantByUserIdLoader = (prisma: PrismaClient) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const assistants = await prisma.assistant.findMany({
      where: { userId: { in: userIds as string[] } },
    });

    const assistantMap = new Map(assistants.map((a) => [a.userId, a]));
    return userIds.map((userId) => assistantMap.get(userId) || null);
  });
