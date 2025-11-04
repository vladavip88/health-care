import { assistantService } from './assistant.service';
import type { Context } from '../../common/context';

export const assistantQueries = {
  /**
   * Get all assistants in the clinic
   * Accessible by: CLINIC_ADMIN
   */
  assistants: async (_: any, __: any, ctx: Context) => {
    return assistantService(ctx).list();
  },

  /**
   * Get a single assistant by ID
   * Accessible by: CLINIC_ADMIN, ASSISTANT (own profile only)
   */
  assistant: async (_: any, { id }: { id: string }, ctx: Context) => {
    return assistantService(ctx).getById(id);
  },

  /**
   * Get the assistant profile for the currently authenticated user
   * Accessible by: ASSISTANT
   */
  myAssistantProfile: async (_: any, __: any, ctx: Context) => {
    return assistantService(ctx).getMyProfile();
  },
};
