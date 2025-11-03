import type { PrismaClient, User, Role } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  clinicId: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  active?: boolean;
  emailVerified?: boolean;
}

export interface UserFilters {
  clinicId?: string;
  role?: Role;
  active?: boolean;
  search?: string;
}

/**
 * User Repository Layer
 * Pure database operations without business logic or authorization
 */
export function createUserRepository(prisma: PrismaClient) {
  return {
    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
      return prisma.user.findUnique({
        where: { id },
      });
    },

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
      return prisma.user.findUnique({
        where: { email },
      });
    },

    /**
     * Find many users with filters
     */
    async findMany(filters: UserFilters = {}): Promise<User[]> {
      const { clinicId, role, active, search } = filters;

      return prisma.user.findMany({
        where: {
          ...(clinicId && { clinicId }),
          ...(role && { role }),
          ...(active !== undefined && { active }),
          ...(search && {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    /**
     * Create a new user
     */
    async create(data: CreateUserData): Promise<User> {
      return prisma.user.create({
        data,
      });
    },

    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserData): Promise<User> {
      return prisma.user.update({
        where: { id },
        data,
      });
    },

    /**
     * Delete a user (soft delete by setting active: false is recommended)
     */
    async delete(id: string): Promise<User> {
      return prisma.user.delete({
        where: { id },
      });
    },

    /**
     * Count users with filters
     */
    async count(filters: UserFilters = {}): Promise<number> {
      const { clinicId, role, active, search } = filters;

      return prisma.user.count({
        where: {
          ...(clinicId && { clinicId }),
          ...(role && { role }),
          ...(active !== undefined && { active }),
          ...(search && {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      });
    },

    /**
     * Check if user exists by email
     */
    async existsByEmail(email: string): Promise<boolean> {
      const count = await prisma.user.count({
        where: { email },
      });
      return count > 0;
    },
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
