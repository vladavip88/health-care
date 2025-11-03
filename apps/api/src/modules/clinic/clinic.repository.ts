import type { PrismaClient, Clinic } from '@prisma/client';

export interface CreateClinicData {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionUntil?: Date;
  website?: string;
  logoUrl?: string;
}

export interface UpdateClinicData {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionUntil?: Date;
  website?: string;
  logoUrl?: string;
}

export interface ClinicFilters {
  search?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
}

/**
 * Clinic Repository Layer
 * Pure database operations without business logic or authorization
 */
export function createClinicRepository(prisma: PrismaClient) {
  return {
    /**
     * Find clinic by ID
     */
    async findById(id: string): Promise<Clinic | null> {
      return prisma.clinic.findUnique({
        where: { id },
      });
    },

    /**
     * Find clinic by ID with relations
     */
    async findByIdWithRelations(id: string) {
      return prisma.clinic.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              doctors: true,
              assistants: true,
              patients: true,
              appointments: true,
            },
          },
        },
      });
    },

    /**
     * Find many clinics with filters
     */
    async findMany(filters: ClinicFilters = {}): Promise<Clinic[]> {
      const { search, subscriptionStatus, subscriptionPlan } = filters;

      return prisma.clinic.findMany({
        where: {
          ...(subscriptionStatus && { subscriptionStatus }),
          ...(subscriptionPlan && { subscriptionPlan }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { legalName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    /**
     * Create a new clinic
     */
    async create(data: CreateClinicData): Promise<Clinic> {
      return prisma.clinic.create({
        data,
      });
    },

    /**
     * Update an existing clinic
     */
    async update(id: string, data: UpdateClinicData): Promise<Clinic> {
      return prisma.clinic.update({
        where: { id },
        data,
      });
    },

    /**
     * Delete a clinic
     */
    async delete(id: string): Promise<Clinic> {
      return prisma.clinic.delete({
        where: { id },
      });
    },

    /**
     * Count clinics with filters
     */
    async count(filters: ClinicFilters = {}): Promise<number> {
      const { search, subscriptionStatus, subscriptionPlan } = filters;

      return prisma.clinic.count({
        where: {
          ...(subscriptionStatus && { subscriptionStatus }),
          ...(subscriptionPlan && { subscriptionPlan }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { legalName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      });
    },

    /**
     * Get clinic statistics
     */
    async getStats(clinicId: string) {
      const [userCount, doctorCount, assistantCount, patientCount, appointmentCount] =
        await Promise.all([
          prisma.user.count({ where: { clinicId } }),
          prisma.doctor.count({ where: { clinicId } }),
          prisma.assistant.count({ where: { clinicId } }),
          prisma.patient.count({ where: { clinicId } }),
          prisma.appointment.count({ where: { clinicId } }),
        ]);

      return {
        users: userCount,
        doctors: doctorCount,
        assistants: assistantCount,
        patients: patientCount,
        appointments: appointmentCount,
      };
    },

    /**
     * Update subscription
     */
    async updateSubscription(
      id: string,
      plan: string,
      status: string,
      until?: Date
    ): Promise<Clinic> {
      return prisma.clinic.update({
        where: { id },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: status,
          subscriptionUntil: until,
        },
      });
    },
  };
}

export type ClinicRepository = ReturnType<typeof createClinicRepository>;
