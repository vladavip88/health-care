import { GraphQLError } from 'graphql';
import { weeklySlotRepository } from './weeklySlot.repository';
import type { AuthenticatedContext } from '../../common/types/context';

interface CreateWeeklySlotInput {
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  durationMin?: number;
  active?: boolean;
}

interface UpdateWeeklySlotInput {
  weekday?: number;
  startTime?: string;
  endTime?: string;
  durationMin?: number;
  active?: boolean;
}

interface WeeklySlotDataInput {
  weekday: number;
  startTime: string;
  endTime: string;
  durationMin?: number;
  active?: boolean;
}

interface BulkCreateWeeklySlotInput {
  doctorId: string;
  slots: WeeklySlotDataInput[];
}

export const weeklySlotService = (ctx: AuthenticatedContext) => {
  const repo = weeklySlotRepository(ctx.prisma);

  /**
   * Validate weekday (1-7)
   */
  const validateWeekday = (weekday: number) => {
    if (weekday < 1 || weekday > 7) {
      throw new GraphQLError('Weekday must be between 1 (Monday) and 7 (Sunday)', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Validate time format (HH:MM)
   */
  const validateTimeFormat = (time: string) => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new GraphQLError('Time must be in HH:MM format (e.g., 09:00, 14:30)', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Validate that end time is after start time
   */
  const validateTimeRange = (startTime: string, endTime: string) => {
    if (startTime >= endTime) {
      throw new GraphQLError('End time must be after start time', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  };

  /**
   * Check if doctor belongs to the current clinic
   */
  const verifyDoctorClinic = async (doctorId: string) => {
    const doctor = await ctx.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new GraphQLError('Doctor not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (doctor.clinicId !== ctx.clinicId) {
      throw new GraphQLError('Forbidden: Doctor belongs to a different clinic', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return doctor;
  };

  /**
   * Check if user is the doctor or clinic admin
   */
  const verifyDoctorOwnership = async (doctorId: string) => {
    if (ctx.user.role === 'DOCTOR') {
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!doctor || doctor.id !== doctorId) {
        throw new GraphQLError('Forbidden: Doctors can only manage their own weekly slots', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
    }
  };

  return {
    /**
     * Get all weekly slots for a doctor
     */
    getByDoctor: async (doctorId: string) => {
      await verifyDoctorClinic(doctorId);
      return repo.findByDoctor(doctorId);
    },

    /**
     * Get active weekly slots for a doctor
     */
    getActiveByDoctor: async (doctorId: string) => {
      await verifyDoctorClinic(doctorId);
      return repo.findActiveByDoctor(doctorId);
    },

    /**
     * Get a single weekly slot by ID
     */
    getById: async (id: string) => {
      const slot = await repo.findById(id);

      if (!slot) {
        throw new GraphQLError('Weekly slot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy - load doctor to verify clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: slot.doctorId },
        select: { clinicId: true },
      });

      if (!doctor || doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Weekly slot belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return slot;
    },

    /**
     * Get weekly slots for the current doctor
     */
    getMySlots: async () => {
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!doctor) {
        throw new GraphQLError('Doctor profile not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return repo.findByDoctor(doctor.id);
    },

    /**
     * Create a new weekly slot
     */
    create: async (data: CreateWeeklySlotInput) => {
      // Validate inputs
      validateWeekday(data.weekday);
      validateTimeFormat(data.startTime);
      validateTimeFormat(data.endTime);
      validateTimeRange(data.startTime, data.endTime);

      // Verify doctor and permissions
      await verifyDoctorClinic(data.doctorId);
      await verifyDoctorOwnership(data.doctorId);

      // Check for exact duplicate
      const exactSlot = await repo.findExact(data.doctorId, data.weekday, data.startTime, data.endTime);
      if (exactSlot) {
        throw new GraphQLError('This exact time slot already exists for this doctor', {
          extensions: { code: 'CONFLICT' },
        });
      }

      // Check for overlapping slots
      const overlapping = await repo.findOverlapping(data.doctorId, data.weekday, data.startTime, data.endTime);
      if (overlapping) {
        throw new GraphQLError('This time slot overlaps with an existing slot', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const slot = await repo.create({
        weekday: data.weekday,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMin: data.durationMin,
        active: data.active ?? true,
        doctor: { connect: { id: data.doctorId } },
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.create',
        entity: 'WeeklySlot',
        entityId: slot.id,
        metadata: {
          doctorId: data.doctorId,
          weekday: data.weekday,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      return slot;
    },

    /**
     * Bulk create weekly slots
     */
    bulkCreate: async (data: BulkCreateWeeklySlotInput) => {
      // Verify doctor and permissions
      await verifyDoctorClinic(data.doctorId);
      await verifyDoctorOwnership(data.doctorId);

      const createdSlots: any[] = [];
      const errors: string[] = [];

      for (const slotData of data.slots) {
        try {
          // Validate inputs
          validateWeekday(slotData.weekday);
          validateTimeFormat(slotData.startTime);
          validateTimeFormat(slotData.endTime);
          validateTimeRange(slotData.startTime, slotData.endTime);

          // Check for exact duplicate
          const exactSlot = await repo.findExact(
            data.doctorId,
            slotData.weekday,
            slotData.startTime,
            slotData.endTime
          );
          if (exactSlot) {
            errors.push(
              `Slot on weekday ${slotData.weekday} from ${slotData.startTime} to ${slotData.endTime} already exists`
            );
            continue;
          }

          // Check for overlapping slots
          const overlapping = await repo.findOverlapping(
            data.doctorId,
            slotData.weekday,
            slotData.startTime,
            slotData.endTime
          );
          if (overlapping) {
            errors.push(
              `Slot on weekday ${slotData.weekday} from ${slotData.startTime} to ${slotData.endTime} overlaps with existing slot`
            );
            continue;
          }

          const slot = await repo.create({
            weekday: slotData.weekday,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            durationMin: slotData.durationMin,
            active: slotData.active ?? true,
            doctor: { connect: { id: data.doctorId } },
          });

          createdSlots.push(slot);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error creating slot: ${errorMessage}`);
        }
      }

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.bulkCreate',
        entity: 'WeeklySlot',
        entityId: data.doctorId,
        metadata: {
          doctorId: data.doctorId,
          created: createdSlots.length,
          errors: errors.length,
          errorMessages: errors,
        },
      });

      if (createdSlots.length === 0 && errors.length > 0) {
        throw new GraphQLError(`Failed to create any slots. Errors: ${errors.join(', ')}`, {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      return createdSlots;
    },

    /**
     * Update a weekly slot
     */
    update: async (id: string, data: UpdateWeeklySlotInput) => {
      const slot = await repo.findById(id);

      if (!slot) {
        throw new GraphQLError('Weekly slot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy - load doctor to verify clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: slot.doctorId },
        select: { clinicId: true },
      });

      if (!doctor || doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Weekly slot belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify ownership
      await verifyDoctorOwnership(slot.doctorId);

      // Validate inputs if provided
      if (data.weekday !== undefined) {
        validateWeekday(data.weekday);
      }
      if (data.startTime !== undefined) {
        validateTimeFormat(data.startTime);
      }
      if (data.endTime !== undefined) {
        validateTimeFormat(data.endTime);
      }

      // Validate time range if both times are provided or being updated
      const newStartTime = data.startTime ?? slot.startTime;
      const newEndTime = data.endTime ?? slot.endTime;
      validateTimeRange(newStartTime, newEndTime);

      // Check for overlapping slots if time or weekday is being changed
      if (data.weekday !== undefined || data.startTime !== undefined || data.endTime !== undefined) {
        const newWeekday = data.weekday ?? slot.weekday;
        const overlapping = await repo.findOverlapping(slot.doctorId, newWeekday, newStartTime, newEndTime, id);

        if (overlapping) {
          throw new GraphQLError('Updated time slot overlaps with an existing slot', {
            extensions: { code: 'CONFLICT' },
          });
        }
      }

      const updatedSlot = await repo.update(id, {
        ...(data.weekday !== undefined && { weekday: data.weekday }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.durationMin !== undefined && { durationMin: data.durationMin }),
        ...(data.active !== undefined && { active: data.active }),
      });

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.update',
        entity: 'WeeklySlot',
        entityId: id,
        metadata: { changes: data },
      });

      return updatedSlot;
    },

    /**
     * Delete a weekly slot
     */
    delete: async (id: string) => {
      const slot = await repo.findById(id);

      if (!slot) {
        throw new GraphQLError('Weekly slot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy - load doctor to verify clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: slot.doctorId },
        select: { clinicId: true },
      });

      if (!doctor || doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Weekly slot belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify ownership
      await verifyDoctorOwnership(slot.doctorId);

      const deletedSlot = await repo.delete(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.delete',
        entity: 'WeeklySlot',
        entityId: id,
        metadata: {
          doctorId: slot.doctorId,
          weekday: slot.weekday,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });

      return deletedSlot;
    },

    /**
     * Activate a weekly slot
     */
    activate: async (id: string) => {
      const slot = await repo.findById(id);

      if (!slot) {
        throw new GraphQLError('Weekly slot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy - load doctor to verify clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: slot.doctorId },
        select: { clinicId: true },
      });

      if (!doctor || doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Weekly slot belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify ownership
      await verifyDoctorOwnership(slot.doctorId);

      if (slot.active) {
        throw new GraphQLError('Weekly slot is already active', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const activatedSlot = await repo.activate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.activate',
        entity: 'WeeklySlot',
        entityId: id,
        metadata: { doctorId: slot.doctorId },
      });

      return activatedSlot;
    },

    /**
     * Deactivate a weekly slot
     */
    deactivate: async (id: string) => {
      const slot = await repo.findById(id);

      if (!slot) {
        throw new GraphQLError('Weekly slot not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check tenancy - load doctor to verify clinic
      const doctor = await ctx.prisma.doctor.findUnique({
        where: { id: slot.doctorId },
        select: { clinicId: true },
      });

      if (!doctor || doctor.clinicId !== ctx.clinicId) {
        throw new GraphQLError('Forbidden: Weekly slot belongs to a different clinic', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify ownership
      await verifyDoctorOwnership(slot.doctorId);

      if (!slot.active) {
        throw new GraphQLError('Weekly slot is already inactive', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const deactivatedSlot = await repo.deactivate(id);

      // Audit log
      await ctx.audit?.log({
        clinicId: ctx.clinicId,
        actorId: ctx.user.id,
        action: 'weeklySlot.deactivate',
        entity: 'WeeklySlot',
        entityId: id,
        metadata: { doctorId: slot.doctorId },
      });

      return deactivatedSlot;
    },
  };
};
