import { PrismaClient, Prisma } from '@prisma/client';

export const patientRepository = (prisma: PrismaClient) => ({
  /**
   * Find patient by ID
   * Nested relations (user, clinic, appointments) are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.patient.findUnique({
      where: { id },
    }),

  /**
   * Find patient by user ID
   * Nested relations (user, clinic, appointments) are resolved by their respective DataLoaders
   */
  findByUserId: (userId: string) =>
    prisma.patient.findUnique({
      where: { userId },
    }),

  /**
   * Find all patients in a clinic
   * Nested relations (user, appointments) are resolved by their respective DataLoaders
   */
  findManyByClinic: (clinicId: string) =>
    prisma.patient.findMany({
      where: { clinicId },
      orderBy: {
        lastName: 'asc',
      },
    }),

  /**
   * Search patients in a clinic
   * Nested relations (user, appointments) are resolved by their respective DataLoaders
   */
  search: (clinicId: string, searchTerm: string) =>
    prisma.patient.findMany({
      where: {
        clinicId,
        OR: [
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            phone: {
              contains: searchTerm,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      },
      orderBy: {
        lastName: 'asc',
      },
    }),

  /**
   * Find patient by email in clinic
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  findByEmail: (clinicId: string, email: string) =>
    prisma.patient.findFirst({
      where: {
        clinicId,
        email,
      },
    }),

  /**
   * Find patient by phone in clinic
   * Nested relations (user) are resolved by their respective DataLoaders
   */
  findByPhone: (clinicId: string, phone: string) =>
    prisma.patient.findMany({
      where: {
        clinicId,
        phone: {
          contains: phone,
        },
      },
    }),

  /**
   * Create a new patient
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  create: (data: Prisma.PatientCreateInput) =>
    prisma.patient.create({
      data,
    }),

  /**
   * Update patient by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.PatientUpdateInput) =>
    prisma.patient.update({
      where: { id },
      data,
    }),

  /**
   * Delete patient by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.patient.delete({
      where: { id },
    }),

  /**
   * Count patients in a clinic
   */
  count: (clinicId: string) =>
    prisma.patient.count({
      where: { clinicId },
    }),

  /**
   * Check if patient exists
   */
  exists: (id: string) =>
    prisma.patient
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),

  /**
   * Get patients by doctor (patients who had appointments with this doctor)
   * Nested relations (user, appointments) are resolved by their respective DataLoaders
   */
  findByDoctor: (doctorId: string, clinicId: string) =>
    prisma.patient.findMany({
      where: {
        clinicId,
        appointments: {
          some: {
            doctorId,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    }),
});
