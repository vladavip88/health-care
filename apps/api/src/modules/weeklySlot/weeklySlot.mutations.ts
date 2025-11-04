import { weeklySlotService } from './weeklySlot.service';
import type { Context } from '../../common/context';

interface CreateWeeklySlotArgs {
  data: {
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    durationMin?: number;
    active?: boolean;
  };
}

interface BulkCreateWeeklySlotArgs {
  data: {
    doctorId: string;
    slots: {
      weekday: number;
      startTime: string;
      endTime: string;
      durationMin?: number;
      active?: boolean;
    }[];
  };
}

interface UpdateWeeklySlotArgs {
  id: string;
  data: {
    weekday?: number;
    startTime?: string;
    endTime?: string;
    durationMin?: number;
    active?: boolean;
  };
}

interface WeeklySlotIdArgs {
  id: string;
}

export const weeklySlotMutations = {
  /**
   * Create a new weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  createWeeklySlot: async (_: any, { data }: CreateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx).create(data);
  },

  /**
   * Bulk create weekly slots
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  bulkCreateWeeklySlots: async (_: any, { data }: BulkCreateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx).bulkCreate(data);
  },

  /**
   * Update a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  updateWeeklySlot: async (_: any, { id, data }: UpdateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx).update(id, data);
  },

  /**
   * Delete a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  deleteWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx).delete(id);
  },

  /**
   * Activate a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  activateWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx).activate(id);
  },

  /**
   * Deactivate a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  deactivateWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx).deactivate(id);
  },
};
