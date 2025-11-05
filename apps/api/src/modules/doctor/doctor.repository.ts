import { PrismaClient, Prisma } from '@prisma/client';

export const doctorRepository = (prisma: PrismaClient) => ({
  /**
   * Find doctor by ID
   * Nested relations (user, clinic, slots, appointments) are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.doctor.findUnique({
      where: { id },
    }),

  /**
   * Find doctor by user ID
   * Nested relations (user, clinic, slots) are resolved by their respective DataLoaders
   */
  findByUserId: (userId: string) =>
    prisma.doctor.findUnique({
      where: { userId },
    }),

  /**
   * Find all doctors in a clinic
   * Nested relations (user, slots) are resolved by their respective DataLoaders
   */
  findManyByClinic: (clinicId: string) =>
    prisma.doctor.findMany({
      where: { clinicId },
      orderBy: {
        createdAt: 'desc',
      },
    }),

  /**
   * Find doctors by specialty
   * Nested relations (user, slots) are resolved by their respective DataLoaders
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
    }),

  /**
   * Find doctors accepting new patients
   * Nested relations (user, slots) are resolved by their respective DataLoaders
   */
  findAcceptingNewPatients: (clinicId: string) =>
    prisma.doctor.findMany({
      where: {
        clinicId,
        isAcceptingNewPatients: true,
      },
    }),

  /**
   * Create a new doctor
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  create: (data: Prisma.DoctorCreateInput) =>
    prisma.doctor.create({
      data,
    }),

  /**
   * Update doctor by ID
   * Nested relations (user, clinic, slots) are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.DoctorUpdateInput) =>
    prisma.doctor.update({
      where: { id },
      data,
    }),

  /**
   * Delete doctor by ID
   * Nested relations (user, clinic) are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.doctor.delete({
      where: { id },
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
