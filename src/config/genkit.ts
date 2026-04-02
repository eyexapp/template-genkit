import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { vertexAI } from '@genkit-ai/vertexai';
import { getEnv } from './env.js';

let instance: ReturnType<typeof genkit> | undefined;

export function getAI() {
  if (!instance) {
    const env = getEnv();

    const plugins =
      env.GENKIT_ENV === 'production' && env.GOOGLE_CLOUD_PROJECT
        ? [
            vertexAI({
              projectId: env.GOOGLE_CLOUD_PROJECT,
              location: env.GOOGLE_CLOUD_LOCATION,
            }),
          ]
        : [googleAI()];

    instance = genkit({ plugins });
  }
  return instance;
}
