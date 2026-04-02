import { z } from 'zod';
import { getAI } from '../config/index.js';

const ai = getAI();

export const exampleTool = ai.defineTool(
  {
    name: 'exampleTool',
    description: 'An example tool that returns the current timestamp',
    inputSchema: z.object({
      format: z.enum(['iso', 'unix']).default('iso'),
    }),
    outputSchema: z.string(),
  },
  async ({ format }) => {
    return format === 'unix' ? String(Date.now()) : new Date().toISOString();
  },
);
