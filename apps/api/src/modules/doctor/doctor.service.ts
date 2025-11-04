import { GraphQLError } from 'graphql';
import { doctorRepository } from './doctor.repository';
import type { Context } from '../../common/context';

interface CreateDoctorInput {
  userId: string;
  specialty?: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  languages?: string[];
  gcalCalendarId?: string;
  isAcceptingNewPatients?: boolean;
  timezone?: string;
}

interface UpdateDoctorInput {
  specialty?: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  languages?: string[];
  gcalCalendarId?: string;
  isAcceptingNewPatients?: boolean;
  timezone?: string;
}

export const doctorService = (ctx: Context) => {
  const repo = doctorRepository(ctx.prisma);

  return {
    /**
     * List all doctors in the clinic
     * Only accessible by CLINIC_ADMIN and ASSISTANT
     */
    list: async () => {
      return repo.findManyByClinic(ctx.clinicId);
    },

    /**
     * Get a single doctor by ID
     * Doctors can only view their own profile unless they are CLINIC_ADMIN or ASSISTANT
     */
    getById: async (id: string) => {
      const doctor = await repo.findById(id);

      if (!doctor) {
        throw new GraphQLError('Doctor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If the user is a DOCTOR, they can only view their own profile
      if (ctx.user.role === 'DOCTOR') {
        const requestingDoctor = await repo.findByUserId(ctx.user.id);
        if (!requestingDoctor || requestingDoctor.id !== id) {
          throw new GraphQLError('Forbidden: Doctors can only view their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return doctor;
    },

    /**
     * Get the doctor profile for the currently authenticated user
     * Only accessible by users with DOCTOR role
     */
    getMyProfile: async () => {
      const doctor = await repo.findByUserId(ctx.user.id);

      if (!doctor) {
        throw new GraphQLError('Doctor profile not found for current user', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Verify tenancy
      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return doctor;
    },

    /**
     * Create a new doctor
     * Only accessible by CLINIC_ADMIN
     */
    create: async (data: CreateDoctorInput) => {
      // Verify that the user exists and belongs to the same clinic
      const user = await ctx.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (user.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: User belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (user.role !== 'DOCTOR') {
        throw new GraphQLError('User must have DOCTOR role', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if doctor profile already exists for this user
      const existingDoctor = await repo.findByUserId(data.userId);
      if (existingDoctor) {
        throw new GraphQLError('Doctor profile already exists for this user', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const doctor = await repo.create({
        specialty: data.specialty,
        title: data.title,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        languages: data.languages || [],
        gcalCalendarId: data.gcalCalendarId,
        isAcceptingNewPatients: data.isAcceptingNewPatients ?? true,
        timezone: data.timezone,
        user: { connect: { id: data.userId } },
        clinic: { connect: { id: ctx.clinicId } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'doctor.create',
        entity: 'Doctor',
        entityId: doctor.id,
        metadata: { specialty: data.specialty, userId: data.userId },
      });

      return doctor;
    },

    /**
     * Update a doctor
     * CLINIC_ADMIN can update any doctor in their clinic
     * DOCTOR can only update their own profile
     */
    update: async (id: string, data: UpdateDoctorInput) => {
      const doctor = await repo.findById(id);

      if (!doctor) {
        throw new GraphQLError('Doctor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If the user is a DOCTOR, they can only update their own profile
      if (ctx.user.role === 'DOCTOR') {
        const requestingDoctor = await repo.findByUserId(ctx.user.id);
        if (!requestingDoctor || requestingDoctor.id !== id) {
          throw new GraphQLError('Forbidden: Doctors can only update their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      const updatedDoctor = await repo.update(id, {
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.languages !== undefined && { languages: data.languages }),
        ...(data.gcalCalendarId !== undefined && { gcalCalendarId: data.gcalCalendarId }),
        ...(data.isAcceptingNewPatients !== undefined && {
          isAcceptingNewPatients: data.isAcceptingNewPatients,
        }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'doctor.update',
        entity: 'Doctor',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedDoctor;
    },

    /**
     * Delete a doctor
     * Only accessible by CLINIC_ADMIN
     */
    delete: async (id: string) => {
      const doctor = await repo.findById(id);

      if (!doctor) {
        throw new GraphQLError('Doctor not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Check if doctor has appointments
      const appointmentCount = await ctx.prisma.appointment.count({
        where: { doctorId: id },
      });

      if (appointmentCount > 0) {
        throw new GraphQLError('Cannot delete doctor with existing appointments', {
          extensions: { code: 'CONFLICT', appointmentCount },
        });
      }

      const deletedDoctor = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'doctor.delete',
        entity: 'Doctor',
        entityId: id,
        metadata: { userId: doctor.userId },
      });

      return deletedDoctor;
    },
  };
};
