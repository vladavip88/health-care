import { weeklySlotService } from './weeklySlot.service';
import type { Context } from '../../common/context';

export const weeklySlotQueries = {
  /**
   * Get all weekly slots for a doctor
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only), ASSISTANT
   */
  weeklySlots: async (_: any, { doctorId }: { doctorId: string }, ctx: Context) => {
    return weeklySlotService(ctx).getByDoctor(doctorId);
  },

  /**
   * Get a single weekly slot by ID
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only), ASSISTANT
   */
  weeklySlot: async (_: any, { id }: { id: string }, ctx: Context) => {
    return weeklySlotService(ctx).getById(id);
  },

  /**
   * Get weekly slots for the current doctor
   * Accessible by: DOCTOR
   */
  myWeeklySlots: async (_: any, __: any, ctx: Context) => {
    return weeklySlotService(ctx).getMySlots();
  },

  /**
   * Get active weekly slots for a doctor
   * Accessible by: CLINIC_ADMIN, DOCTOR (own only), ASSISTANT
   */
  activeWeeklySlots: async (_: any, { doctorId }: { doctorId: string }, ctx: Context) => {
    return weeklySlotService(ctx).getActiveByDoctor(doctorId);
  },
};
