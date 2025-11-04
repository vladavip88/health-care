import { GraphQLError } from 'graphql';
import { patientRepository } from './patient.repository';
import type { Context } from '../../common/types/context';

interface CreatePatientInput {
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

interface PatientSearchInput {
  query?: string;
  email?: string;
  phone?: string;
}

export const patientService = (ctx: Context) => {
  const repo = patientRepository(ctx.prisma);

  return {
    /**
     * List all patients in the clinic or search
     * Accessible by CLINIC_ADMIN, DOCTOR, ASSISTANT
     * DOCTOR can only see their own patients
     */
    list: async (search?: PatientSearchInput) => {
      // If user is a DOCTOR, only show patients they have appointments with
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor) {
          throw new GraphQLError('Doctor profile not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return repo.findByDoctor(doctor.id, ctx.clinicId);
      }

      // Search if query provided
      if (search?.query) {
        return repo.search(ctx.clinicId, search.query);
      }

      // Search by email
      if (search?.email) {
        const patient = await repo.findByEmail(ctx.clinicId, search.email);
        return patient ? [patient] : [];
      }

      // Search by phone
      if (search?.phone) {
        return repo.findByPhone(ctx.clinicId, search.phone);
      }

      // Return all patients
      return repo.findManyByClinic(ctx.clinicId);
    },

    /**
     * Get a single patient by ID
     * CLINIC_ADMIN and ASSISTANT can view any patient
     * DOCTOR can only view patients they have appointments with
     * PATIENT can only view their own profile
     */
    getById: async (id: string) => {
      const patient = await repo.findById(id);

      if (!patient) {
        throw new GraphQLError('Patient not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (patient.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Patient belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a PATIENT, they can only view their own profile
      if (ctx.user.role === 'PATIENT') {
        const requestingPatient = await repo.findByUserId(ctx.user.id);
        if (!requestingPatient || requestingPatient.id !== id) {
          throw new GraphQLError('Forbidden: Patients can only view their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      // If user is a DOCTOR, check if they have appointments with this patient
      if (ctx.user.role === 'DOCTOR') {
        const doctor = await ctx.prisma.doctor.findUnique({
          where: { userId: ctx.user.id },
        });

        if (!doctor) {
          throw new GraphQLError('Doctor profile not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        const hasAppointment = await ctx.prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            patientId: id,
          },
        });

        if (!hasAppointment) {
          throw new GraphQLError('Forbidden: Doctors can only view patients they have appointments with', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return patient;
    },

    /**
     * Get the patient profile for the currently authenticated user
     * Only accessible by users with PATIENT role
     */
    getMyProfile: async () => {
      const patient = await repo.findByUserId(ctx.user.id);

      if (!patient) {
        throw new GraphQLError('Patient profile not found for current user', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Verify tenancy
      if (patient.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Patient belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return patient;
    },

    /**
     * Create a new patient
     * Only accessible by CLINIC_ADMIN and ASSISTANT
     */
    create: async (data: CreatePatientInput) => {
      // If userId is provided, verify the user exists and belongs to the same clinic
      if (data.userId) {
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

        if (user.role !== 'PATIENT') {
          throw new GraphQLError('User must have PATIENT role', {
            extensions: { code: 'BAD_REQUEST' },
          });
        }

        // Check if patient profile already exists for this user
        const existingPatient = await repo.findByUserId(data.userId);
        if (existingPatient) {
          throw new GraphQLError('Patient profile already exists for this user', {
            extensions: { code: 'CONFLICT' },
          });
        }
      }

      // Check for duplicate email in clinic
      if (data.email) {
        const existingPatient = await repo.findByEmail(ctx.clinicId, data.email);
        if (existingPatient) {
          throw new GraphQLError('Patient with this email already exists in the clinic', {
            extensions: { code: 'CONFLICT' },
          });
        }
      }

      const patient = await repo.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        city: data.city,
        country: data.country || 'RS',
        notes: data.notes,
        clinic: { connect: { id: ctx.clinicId } },
        ...(data.userId && { user: { connect: { id: data.userId } } }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'patient.create',
        entity: 'Patient',
        entityId: patient.id,
        metadata: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          userId: data.userId,
        },
      });

      return patient;
    },

    /**
     * Update a patient
     * CLINIC_ADMIN and ASSISTANT can update any patient
     * PATIENT can only update their own profile (limited fields)
     */
    update: async (id: string, data: UpdatePatientInput) => {
      const patient = await repo.findById(id);

      if (!patient) {
        throw new GraphQLError('Patient not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (patient.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Patient belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // If user is a PATIENT, they can only update their own profile
      // and cannot update notes (internal field)
      if (ctx.user.role === 'PATIENT') {
        const requestingPatient = await repo.findByUserId(ctx.user.id);
        if (!requestingPatient || requestingPatient.id !== id) {
          throw new GraphQLError('Forbidden: Patients can only update their own profile', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        // Patients cannot update notes
        if (data.notes !== undefined) {
          throw new GraphQLError('Forbidden: Patients cannot modify internal notes', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      // Check for duplicate email in clinic (if email is being changed)
      if (data.email && data.email !== patient.email) {
        const existingPatient = await repo.findByEmail(ctx.clinicId, data.email);
        if (existingPatient && existingPatient.id !== id) {
          throw new GraphQLError('Patient with this email already exists in the clinic', {
            extensions: { code: 'CONFLICT' },
          });
        }
      }

      const updatedPatient = await repo.update(id, {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dob !== undefined && { dob: data.dob }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.notes !== undefined && { notes: data.notes }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'patient.update',
        entity: 'Patient',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedPatient;
    },

    /**
     * Delete a patient
     * Only accessible by CLINIC_ADMIN
     */
    delete: async (id: string) => {
      const patient = await repo.findById(id);

      if (!patient) {
        throw new GraphQLError('Patient not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy
      if (patient.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Patient belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Check if patient has appointments
      const appointmentCount = await ctx.prisma.appointment.count({
        where: { patientId: id },
      });

      if (appointmentCount > 0) {
        throw new GraphQLError(
          'Cannot delete patient with existing appointments. Consider anonymizing patient data instead.',
          {
            extensions: { code: 'CONFLICT', appointmentCount },
          }
        );
      }

      const deletedPatient = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'patient.delete',
        entity: 'Patient',
        entityId: id,
        metadata: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          userId: patient.userId,
        },
      });

      return deletedPatient;
    },
  };
};
