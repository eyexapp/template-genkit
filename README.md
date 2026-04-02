# Genkit Template

A production-ready server-side AI orchestration template built on [Google Genkit](https://github.com/firebase/genkit). Features dual AI provider support, Firebase Cloud Functions deployment, centralized Zod schema validation, and a clean layered architecture.

## Features

- **Dual AI Provider** — Google AI (API key, dev) + Vertex AI (GCP, production), switch via env var
- **Firebase Cloud Functions** — Deploy flows as callable Cloud Functions with `onCallGenkit()`
- **Schema-First** — Centralized Zod schemas for all inputs/outputs with runtime validation
- **Genkit Flows** — Type-safe, observable AI pipelines with streaming support
- **Structured Prompts** — `ai.definePrompt()` with template variables and output schemas
- **AI Tools** — `ai.defineTool()` for functions AI models can call during generation
- **Developer UI** — Built-in Genkit playground for local testing and debugging
- **TypeScript** — Strict mode, path aliases (`@/`), full type safety
- **Testing** — Vitest with mocked Genkit providers
- **DX** — ESLint 9, Prettier, Husky, lint-staged, commitlint

## Quick Start

```bash
# Clone and install
git clone <repo-url> my-genkit-app
cd my-genkit-app
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_GENAI_API_KEY

# Start Genkit Developer UI
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_GENAI_API_KEY` | Google AI API key | *(required for dev)* |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | *(required for production)* |
| `GOOGLE_CLOUD_LOCATION` | GCP region | `us-central1` |
| `GENKIT_ENV` | `dev` or `production` | `dev` |

**Provider selection:**
- `GENKIT_ENV=dev` → Uses `@genkit-ai/google-genai` (API key)
- `GENKIT_ENV=production` → Uses `@genkit-ai/vertexai` (GCP credentials)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Genkit Developer UI with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run serve` | Run directly with tsx |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## Architecture

```
src/
├── config/                     # Environment & Genkit initialization
│   ├── env.ts                  # dotenv + Zod env validation
│   ├── genkit.ts               # Genkit instance with plugins
│   └── index.ts
├── schemas/                    # Centralized Zod schemas
│   ├── common.ts               # Shared schemas (AIResponse wrapper)
│   ├── example.schema.ts       # Example input/output schemas
│   └── index.ts
├── prompts/                    # Structured prompt definitions
│   ├── example.prompt.ts       # ai.definePrompt()
│   └── index.ts
├── tools/                      # AI-callable tools
│   ├── example.tool.ts         # ai.defineTool()
│   └── index.ts
├── flows/                      # Business logic pipelines
│   ├── example.flow.ts         # ai.defineFlow()
│   └── index.ts
├── functions/                  # Firebase Cloud Function wrappers
│   ├── example.function.ts     # onCallGenkit()
│   └── index.ts
└── index.ts                    # Main entry, exports all functions & flows
```

### Layer Dependencies

```
config → schemas → prompts + tools → flows → functions → index.ts
```

Each layer only depends on layers to its left. Flows are the core business logic; functions are thin deployment wrappers.

## Adding a New Feature

### 1. Define Schema

```typescript
// src/schemas/my-feature.schema.ts
import { z } from 'zod';

export const MyInputSchema = z.object({
  query: z.string().min(1),
});

export const MyOutputSchema = z.object({
  answer: z.string(),
  confidence: z.number(),
});
```

### 2. Create Prompt

```typescript
// src/prompts/my-feature.prompt.ts
import { getAI } from '../config/index.js';
import { MyInputSchema, MyOutputSchema } from '../schemas/index.js';

const ai = getAI();

export const myPrompt = ai.definePrompt(
  {
    name: 'myPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: MyInputSchema },
    output: { schema: MyOutputSchema },
  },
  `Answer: {{query}}`,
);
```

### 3. Create Flow

```typescript
// src/flows/my-feature.flow.ts
import { getAI } from '../config/index.js';
import { MyInputSchema, MyOutputSchema } from '../schemas/index.js';
import { myPrompt } from '../prompts/index.js';

const ai = getAI();

export const myFlow = ai.defineFlow(
  {
    name: 'myFlow',
    inputSchema: MyInputSchema,
    outputSchema: MyOutputSchema,
  },
  async (input) => {
    const response = await myPrompt(input);
    return response.output!;
  },
);
```

### 4. Deploy as Cloud Function

```typescript
// src/functions/my-feature.function.ts
import { onCallGenkit } from '@genkit-ai/firebase/functions';
import { myFlow } from '../flows/index.js';

export const myFeature = onCallGenkit(myFlow);
```

### 5. Export from index.ts

```typescript
export { myFeature } from './functions/index.js';
export { myFlow } from './flows/index.js';
```

## Deployment

```bash
# Build
npm run build

# Deploy with Firebase CLI
firebase deploy --only functions
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.8 (strict) |
| AI Framework | Genkit 1.x |
| AI Providers | @genkit-ai/google-genai + @genkit-ai/vertexai |
| Deployment | Firebase Cloud Functions v2 |
| Validation | Zod 3.x |
| Testing | Vitest |
| Linting | ESLint 9 (flat config) + Prettier |
| Git Hooks | Husky + lint-staged + commitlint |

## License

[MIT](LICENSE)
