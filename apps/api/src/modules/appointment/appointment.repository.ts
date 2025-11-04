import { PrismaClient, Prisma, AppointmentStatus } from '@prisma/client';

export const appointmentRepository = (prisma: PrismaClient) => ({
  /**
   * Find appointment by ID
   */
  findById: (id: string) =>
    prisma.appointment.findUnique({
      where: { id },
      include: {
        clinic: true,
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
        reminders: true,
      },
    }),

  /**
   * Find all appointments in a clinic
   */
  findManyByClinic: (clinicId: string) =>
    prisma.appointment.findMany({
      where: { clinicId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        start: 'desc',
      },
    }),

  /**
   * Find appointments by doctor
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
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        start: 'asc',
      },
    });
  },

  /**
   * Find appointments by patient
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
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        start: 'desc',
      },
    });
  },

  /**
   * Find appointments by status
   */
  findByStatus: (clinicId: string, status: AppointmentStatus) =>
    prisma.appointment.findMany({
      where: {
        clinicId,
        status,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        start: 'asc',
      },
    }),

  /**
   * Find appointments within date range
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
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
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
   */
  create: (data: Prisma.AppointmentCreateInput) =>
    prisma.appointment.create({
      data,
      include: {
        clinic: true,
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    }),

  /**
   * Update appointment by ID
   */
  update: (id: string, data: Prisma.AppointmentUpdateInput) =>
    prisma.appointment.update({
      where: { id },
      data,
      include: {
        clinic: true,
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    }),

  /**
   * Update appointment status
   */
  updateStatus: (id: string, status: AppointmentStatus) =>
    prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        clinic: true,
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    }),

  /**
   * Delete appointment by ID
   */
  delete: (id: string) =>
    prisma.appointment.delete({
      where: { id },
      include: {
        clinic: true,
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
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
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        start: 'asc',
      },
      take: limit,
    }),

  /**
   * Get upcoming appointments for a patient
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
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        start: 'asc',
      },
      take: limit,
    }),
});
