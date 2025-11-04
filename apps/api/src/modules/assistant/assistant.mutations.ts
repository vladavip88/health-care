import { assistantService } from './assistant.service';
import type { Context } from '../../common/types/context';

export interface CreateAssistantArgs {
  data: {
    userId: string;
    title?: string;
    permissions?: string[];
    active?: boolean;
  };
}

export interface UpdateAssistantArgs {
  id: string;
  data: {
    title?: string;
    permissions?: string[];
    active?: boolean;
  };
}

export interface DeleteAssistantArgs {
  id: string;
}

export interface DeactivateAssistantArgs {
  id: string;
}

export interface ActivateAssistantArgs {
  id: string;
}

export const assistantMutations = {
  /**
   * Create a new assistant
   * Accessible by: CLINIC_ADMIN
   */
  createAssistant: async (_: any, { data }: CreateAssistantArgs, ctx: Context) => {
    return assistantService(ctx).create(data);
  },

  /**
   * Update an assistant
   * Accessible by: CLINIC_ADMIN (any assistant), ASSISTANT (own profile only, limited fields)
   */
  updateAssistant: async (_: any, { id, data }: UpdateAssistantArgs, ctx: Context) => {
    return assistantService(ctx).update(id, data);
  },

  /**
   * Delete an assistant
   * Accessible by: CLINIC_ADMIN
   */
  deleteAssistant: async (_: any, { id }: DeleteAssistantArgs, ctx: Context) => {
    return assistantService(ctx).delete(id);
  },

  /**
   * Deactivate an assistant
   * Accessible by: CLINIC_ADMIN
   */
  deactivateAssistant: async (_: any, { id }: DeactivateAssistantArgs, ctx: Context) => {
    return assistantService(ctx).deactivate(id);
  },

  /**
   * Activate an assistant
   * Accessible by: CLINIC_ADMIN
   */
  activateAssistant: async (_: any, { id }: ActivateAssistantArgs, ctx: Context) => {
    return assistantService(ctx).activate(id);
  },
};
