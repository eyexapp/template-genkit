import { googleAI } from '@genkit-ai/google-genai';
import { getAI } from '../config/index.js';
import { ExampleInputSchema, ExampleOutputSchema } from '../schemas/index.js';

const ai = getAI();

export const examplePrompt = ai.definePrompt(
  {
    name: 'examplePrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: ExampleInputSchema },
    output: { schema: ExampleOutputSchema },
  },
  `{{prompt}}`,
);
