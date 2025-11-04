import { PrismaClient, Prisma } from '@prisma/client';

export const patientRepository = (prisma: PrismaClient) => ({
  /**
   * Find patient by ID
   */
  findById: (id: string) =>
    prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        clinic: true,
        appointments: {
          orderBy: { start: 'desc' },
          take: 10,
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }),

  /**
   * Find patient by user ID
   */
  findByUserId: (userId: string) =>
    prisma.patient.findUnique({
      where: { userId },
      include: {
        user: true,
        clinic: true,
        appointments: {
          orderBy: { start: 'desc' },
          take: 10,
        },
      },
    }),

  /**
   * Find all patients in a clinic
   */
  findManyByClinic: (clinicId: string) =>
    prisma.patient.findMany({
      where: { clinicId },
      include: {
        user: true,
        appointments: {
          orderBy: { start: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    }),

  /**
   * Search patients in a clinic
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
      include: {
        user: true,
        appointments: {
          orderBy: { start: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    }),

  /**
   * Find patient by email in clinic
   */
  findByEmail: (clinicId: string, email: string) =>
    prisma.patient.findFirst({
      where: {
        clinicId,
        email,
      },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Find patient by phone in clinic
   */
  findByPhone: (clinicId: string, phone: string) =>
    prisma.patient.findMany({
      where: {
        clinicId,
        phone: {
          contains: phone,
        },
      },
      include: {
        user: true,
      },
    }),

  /**
   * Create a new patient
   */
  create: (data: Prisma.PatientCreateInput) =>
    prisma.patient.create({
      data,
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Update patient by ID
   */
  update: (id: string, data: Prisma.PatientUpdateInput) =>
    prisma.patient.update({
      where: { id },
      data,
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Delete patient by ID
   */
  delete: (id: string) =>
    prisma.patient.delete({
      where: { id },
      include: {
        user: true,
        clinic: true,
      },
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
      include: {
        user: true,
        appointments: {
          where: { doctorId },
          orderBy: { start: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    }),
});
