import { PrismaClient, Prisma, AppointmentStatus } from '@prisma/client';

export const appointmentRepository = (prisma: PrismaClient) => ({
  /**
   * Find appointment by ID
   * Nested relations (clinic, doctor, patient, createdBy, reminders) are resolved by their respective DataLoaders
   */
  findById: (id: string) =>
    prisma.appointment.findUnique({
      where: { id },
    }),

  /**
   * Find all appointments in a clinic
   * Nested relations (doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  findManyByClinic: (clinicId: string) =>
    prisma.appointment.findMany({
      where: { clinicId },
      orderBy: {
        start: 'desc',
      },
    }),

  /**
   * Find appointments by doctor
   * Nested relations (patient, createdBy) are resolved by their respective DataLoaders
   */
  findByDoctor: (doctorId: string, clinicId: string, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AppointmentWhereInput = {
      doctorId,
      clinicId,
    };

    if (startDate || endDate) {
      where.start = {};
      if (startDate) where.start.gte = startDate;
      if (endDate) where.start.lte = endDate;
    }

    return prisma.appointment.findMany({
      where,
      orderBy: {
        start: 'asc',
      },
    });
  },

  /**
   * Find appointments by patient
   * Nested relations (doctor, createdBy) are resolved by their respective DataLoaders
   */
  findByPatient: (patientId: string, clinicId: string, startDate?: Date, endDate?: Date) => {
    const where: Prisma.AppointmentWhereInput = {
      patientId,
      clinicId,
    };

    if (startDate || endDate) {
      where.start = {};
      if (startDate) where.start.gte = startDate;
      if (endDate) where.start.lte = endDate;
    }

    return prisma.appointment.findMany({
      where,
      orderBy: {
        start: 'desc',
      },
    });
  },

  /**
   * Find appointments by status
   * Nested relations (doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  findByStatus: (clinicId: string, status: AppointmentStatus) =>
    prisma.appointment.findMany({
      where: {
        clinicId,
        status,
      },
      orderBy: {
        start: 'asc',
      },
    }),

  /**
   * Find appointments within date range
   * Nested relations (doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  findByDateRange: (clinicId: string, startDate: Date, endDate: Date) =>
    prisma.appointment.findMany({
      where: {
        clinicId,
        start: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        start: 'asc',
      },
    }),

  /**
   * Check for overlapping appointments for a doctor
   */
  findOverlapping: (doctorId: string, start: Date, end: Date, excludeId?: string) => {
    const where: Prisma.AppointmentWhereInput = {
      doctorId,
      OR: [
        {
          AND: [{ start: { lte: start } }, { end: { gt: start } }],
        },
        {
          AND: [{ start: { lt: end } }, { end: { gte: end } }],
        },
        {
          AND: [{ start: { gte: start } }, { end: { lte: end } }],
        },
      ],
      status: {
        notIn: ['CANCELLED', 'NOSHOW'],
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return prisma.appointment.findFirst({ where });
  },

  /**
   * Create a new appointment
   * Nested relations (clinic, doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  create: (data: Prisma.AppointmentCreateInput) =>
    prisma.appointment.create({
      data,
    }),

  /**
   * Update appointment by ID
   * Nested relations (clinic, doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  update: (id: string, data: Prisma.AppointmentUpdateInput) =>
    prisma.appointment.update({
      where: { id },
      data,
    }),

  /**
   * Update appointment status
   * Nested relations (clinic, doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  updateStatus: (id: string, status: AppointmentStatus) =>
    prisma.appointment.update({
      where: { id },
      data: { status },
    }),

  /**
   * Delete appointment by ID
   * Nested relations (clinic, doctor, patient, createdBy) are resolved by their respective DataLoaders
   */
  delete: (id: string) =>
    prisma.appointment.delete({
      where: { id },
    }),

  /**
   * Count appointments in a clinic
   */
  count: (clinicId: string) =>
    prisma.appointment.count({
      where: { clinicId },
    }),

  /**
   * Count appointments by status
   */
  countByStatus: (clinicId: string, status: AppointmentStatus) =>
    prisma.appointment.count({
      where: {
        clinicId,
        status,
      },
    }),

  /**
   * Check if appointment exists
   */
  exists: (id: string) =>
    prisma.appointment
      .findUnique({
        where: { id },
        select: { id: true },
      })
      .then((result) => !!result),

  /**
   * Get upcoming appointments for a doctor
   * Nested relations (patient) are resolved by their respective DataLoaders
   */
  findUpcomingByDoctor: (doctorId: string, clinicId: string, limit: number = 10) =>
    prisma.appointment.findMany({
      where: {
        doctorId,
        clinicId,
        start: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      orderBy: {
        start: 'asc',
      },
      take: limit,
    }),

  /**
   * Get upcoming appointments for a patient
   * Nested relations (doctor) are resolved by their respective DataLoaders
   */
  findUpcomingByPatient: (patientId: string, clinicId: string, limit: number = 10) =>
    prisma.appointment.findMany({
      where: {
        patientId,
        clinicId,
        start: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      orderBy: {
        start: 'asc',
      },
      take: limit,
    }),
});
