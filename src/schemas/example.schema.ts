import { z } from 'zod';

export const ExampleInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export const ExampleOutputSchema = z.object({
  text: z.string(),
});

export type ExampleInput = z.infer<typeof ExampleInputSchema>;
export type ExampleOutput = z.infer<typeof ExampleOutputSchema>;
