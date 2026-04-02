import { getAI } from '../config/index.js';
import { ExampleInputSchema, ExampleOutputSchema } from '../schemas/index.js';
import type { ExampleInput, ExampleOutput } from '../schemas/index.js';
import { examplePrompt } from '../prompts/index.js';

const ai = getAI();

export const exampleFlow = ai.defineFlow(
  {
    name: 'exampleFlow',
    inputSchema: ExampleInputSchema,
    outputSchema: ExampleOutputSchema,
  },
  async (input: ExampleInput): Promise<ExampleOutput> => {
    const response = await examplePrompt(input);
    return { text: response.text };
  },
);
