import { prisma } from '../lib/prisma';
import type { Role } from '@prisma/client';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  clinicId: string;
}

interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  active?: boolean;
}

export const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },

    user: async (_parent: unknown, args: { id: string }) => {
      return await prisma.user.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createUser: async (_parent: unknown, args: CreateUserInput) => {
      return await prisma.user.create({
        data: {
          email: args.email,
          passwordHash: args.passwordHash,
          firstName: args.firstName,
          lastName: args.lastName,
          phone: args.phone,
          role: args.role,
          clinicId: args.clinicId,
        },
      });
    },

    updateUser: async (_parent: unknown, args: UpdateUserInput) => {
      const { id, ...data } = args;
      return await prisma.user.update({
        where: { id },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.active !== undefined && { active: data.active }),
        },
      });
    },

    deleteUser: async (_parent: unknown, args: { id: string }) => {
      return await prisma.user.delete({
        where: { id: args.id },
      });
    },
  },
};
