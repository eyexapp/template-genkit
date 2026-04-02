import { z } from 'zod';

export const AIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export type AIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
