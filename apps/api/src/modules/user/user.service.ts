import { GraphQLError } from 'graphql';
import type { Role, User } from '@prisma/client';
import type { UserRepository, CreateUserData, UpdateUserData, UserFilters } from './user.repository';
import type { Context } from '../../common/types/context';
import { PERMISSIONS } from '../../common/auth/permissions';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  clinicId: string;
}

export interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  active?: boolean;
}

/**
 * User Service Layer
 * Contains business logic, RBAC enforcement, and multi-tenancy validation
 */
export function createUserService(repository: UserRepository) {
  return {
    /**
     * Get user by ID
     * Validates tenancy and permissions
     */
    async getUserById(id: string, context: Context): Promise<User | null> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await repository.findById(id);

      if (!user) {
        return null;
      }

      // Tenancy check: users can only access users in their clinic
      if (user.clinicId !== context.clinicId) {
        throw new GraphQLError('Forbidden: User not in your clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Permission check: users can read their own data or need USER_READ permission
      const canReadOwnData = context.user.id === user.id;
      const hasReadPermission = context.user.permissions?.includes(PERMISSIONS.USER_READ);

      if (!canReadOwnData && !hasReadPermission) {
        throw new GraphQLError('Forbidden: Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return user;
    },

    /**
     * Get all users in the clinic
     * Enforces tenancy and requires USER_READ permission
     */
    async getUsers(context: Context, filters?: Omit<UserFilters, 'clinicId'>): Promise<User[]> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.USER_READ)) {
        throw new GraphQLError('Forbidden: Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Always scope by clinicId for multi-tenancy
      return repository.findMany({
        ...filters,
        clinicId: context.clinicId,
      });
    },

    /**
     * Create a new user
     * Validates permissions, email uniqueness, and tenancy
     */
    async createUser(input: CreateUserInput, context: Context): Promise<User> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.USER_CREATE)) {
        throw new GraphQLError('Forbidden: Insufficient permissions to create users', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Tenancy check: can only create users in own clinic
      if (input.clinicId !== context.clinicId) {
        throw new GraphQLError('Forbidden: Cannot create users in other clinics', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Check if email already exists
      const existingUser = await repository.findByEmail(input.email);
      if (existingUser) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Validate role assignment
      // Only CLINIC_ADMIN can create other admins
      if (input.role === 'CLINIC_ADMIN' && context.user.role !== 'CLINIC_ADMIN') {
        throw new GraphQLError('Forbidden: Only clinic admins can create admin users', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const userData: CreateUserData = {
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role,
        clinicId: input.clinicId,
      };

      return repository.create(userData);
    },

    /**
     * Update an existing user
     * Validates permissions and tenancy
     */
    async updateUser(input: UpdateUserInput, context: Context): Promise<User> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const existingUser = await repository.findById(input.id);
      if (!existingUser) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Tenancy check
      if (existingUser.clinicId !== context.clinicId) {
        throw new GraphQLError('Forbidden: User not in your clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Permission check: users can update their own data or need USER_UPDATE permission
      const isUpdatingSelf = context.user.id === existingUser.id;
      const hasUpdatePermission = context.user.permissions?.includes(PERMISSIONS.USER_UPDATE);

      if (!isUpdatingSelf && !hasUpdatePermission) {
        throw new GraphQLError('Forbidden: Insufficient permissions to update users', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Users can't change their own active status
      if (isUpdatingSelf && input.active !== undefined) {
        throw new GraphQLError('Forbidden: Cannot change your own active status', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updateData: UpdateUserData = {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        active: input.active,
      };

      return repository.update(input.id, updateData);
    },

    /**
     * Delete a user (soft delete recommended)
     * Validates permissions and tenancy
     */
    async deleteUser(id: string, context: Context): Promise<User> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.USER_DELETE)) {
        throw new GraphQLError('Forbidden: Insufficient permissions to delete users', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const existingUser = await repository.findById(id);
      if (!existingUser) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Tenancy check
      if (existingUser.clinicId !== context.clinicId) {
        throw new GraphQLError('Forbidden: User not in your clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Prevent self-deletion
      if (context.user.id === id) {
        throw new GraphQLError('Forbidden: Cannot delete your own account', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Consider soft delete instead (set active: false)
      // return repository.update(id, { active: false });
      return repository.delete(id);
    },

    /**
     * Search users in the clinic
     */
    async searchUsers(search: string, context: Context): Promise<User[]> {
      if (!context.user) {
        throw new GraphQLError('Unauthorized: User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!context.user.permissions?.includes(PERMISSIONS.USER_READ)) {
        throw new GraphQLError('Forbidden: Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return repository.findMany({
        clinicId: context.clinicId,
        search,
      });
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
