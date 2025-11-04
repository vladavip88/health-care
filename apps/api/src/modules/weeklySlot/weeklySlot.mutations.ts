import { weeklySlotService } from './weeklySlot.service';
import type { Context, AuthenticatedContext } from '../../common/types/context';

export interface CreateWeeklySlotArgs {
  data: {
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    durationMin?: number;
    active?: boolean;
  };
}

export interface BulkCreateWeeklySlotArgs {
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

export interface UpdateWeeklySlotArgs {
  id: string;
  data: {
    weekday?: number;
    startTime?: string;
    endTime?: string;
    durationMin?: number;
    active?: boolean;
  };
}

export interface WeeklySlotIdArgs {
  id: string;
}

export const weeklySlotMutations = {
  /**
   * Create a new weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  createWeeklySlot: async (_: any, { data }: CreateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).create(data);
  },

  /**
   * Bulk create weekly slots
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  bulkCreateWeeklySlots: async (_: any, { data }: BulkCreateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).bulkCreate(data);
  },

  /**
   * Update a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  updateWeeklySlot: async (_: any, { id, data }: UpdateWeeklySlotArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).update(id, data);
  },

  /**
   * Delete a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  deleteWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).delete(id);
  },

  /**
   * Activate a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  activateWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).activate(id);
  },

  /**
   * Deactivate a weekly slot
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only)
   */
  deactivateWeeklySlot: async (_: any, { id }: WeeklySlotIdArgs, ctx: Context) => {
    return weeklySlotService(ctx as AuthenticatedContext).deactivate(id);
  },
};
