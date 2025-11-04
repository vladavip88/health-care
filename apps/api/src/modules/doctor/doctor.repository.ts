import { PrismaClient, Prisma } from '@prisma/client';

export const doctorRepository = (prisma: PrismaClient) => ({
  /**
   * Find doctor by ID
   */
  findById: (id: string) =>
    prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        clinic: true,
        slots: true,
        appointments: {
          orderBy: { start: 'desc' },
          take: 10,
        },
      },
    }),

  /**
   * Find doctor by user ID
   */
  findByUserId: (userId: string) =>
    prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: true,
        clinic: true,
        slots: true,
      },
    }),

  /**
   * Find all doctors in a clinic
   */
  findManyByClinic: (clinicId: string) =>
    prisma.doctor.findMany({
      where: { clinicId },
      include: {
        user: true,
        slots: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find doctors by specialty
   */
  findBySpecialty: (clinicId: string, specialty: string) =>
    prisma.doctor.findMany({
      where: {
        clinicId,
        specialty: {
          contains: specialty,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      },
      include: {
        user: true,
        slots: true,
      },
    }),

  /**
   * Find doctors accepting new patients
   */
  findAcceptingNewPatients: (clinicId: string) =>
    prisma.doctor.findMany({
      where: {
        clinicId,
        isAcceptingNewPatients: true,
      },
      include: {
        user: true,
        slots: true,
      },
    }),

  /**
   * Create a new doctor
   */
  create: (data: Prisma.DoctorCreateInput) =>
    prisma.doctor.create({
      data,
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Update doctor by ID
   */
  update: (id: string, data: Prisma.DoctorUpdateInput) =>
    prisma.doctor.update({
      where: { id },
      data,
      include: {
        user: true,
        clinic: true,
        slots: true,
      },
    }),

  /**
   * Delete doctor by ID
   */
  delete: (id: string) =>
    prisma.doctor.delete({
      where: { id },
      include: {
        user: true,
        clinic: true,
      },
    }),

  /**
   * Count doctors in a clinic
   */
  count: (clinicId: string) =>
    prisma.doctor.count({
      where: { clinicId },
    }),

  /**
   * Check if doctor exists
   */
  exists: (id: string) =>
    prisma.doctor
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),
});
