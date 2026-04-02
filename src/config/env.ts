import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  GOOGLE_GENAI_API_KEY: z.string().min(1, 'GOOGLE_GENAI_API_KEY is required'),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GOOGLE_CLOUD_LOCATION: z.string().default('us-central1'),
  GENKIT_ENV: z.enum(['dev', 'production']).default('dev'),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      const formatted = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${formatted}`);
    }
    cached = result.data;
  }
  return cached;
}
