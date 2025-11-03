import type { PrismaClient } from '@prisma/client';

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
}
