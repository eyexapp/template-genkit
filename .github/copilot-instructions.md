# Genkit Template — Copilot Instructions

## Project Overview
A production-ready server-side AI orchestration template built on Google's Genkit framework. Deploys as Firebase Cloud Functions with dual AI provider support (Google AI for development, Vertex AI for production).

## Architecture

### Layer Hierarchy (dependency direction: config → schemas → prompts/tools → flows → functions)
- **`src/config/`** — Environment validation (Zod + dotenv) and Genkit instance creation with plugins.
- **`src/schemas/`** — Centralized Zod schemas for all flow inputs/outputs. Shared across prompts, flows, and functions.
- **`src/prompts/`** — Structured prompt definitions via `ai.definePrompt()`. Reference schemas from `src/schemas/`.
- **`src/tools/`** — AI-callable tools via `ai.defineTool()`. Functions that AI models can invoke during generation.
- **`src/flows/`** — Core business logic via `ai.defineFlow()`. Compose prompts + tools into observable, typed pipelines.
- **`src/functions/`** — Firebase Cloud Function wrappers via `onCallGenkit()`. Thin deployment layer around flows.
- **`src/index.ts`** — Main entry point. Re-exports all Cloud Functions and flows.

### Key Patterns
- **Dual Provider**: Google AI (API key, dev) + Vertex AI (GCP, production). Switch via `GENKIT_ENV` env var.
- **Schema-First**: All inputs/outputs defined as Zod schemas in `src/schemas/`, imported by prompts and flows.
- **Flow Composition**: Flows orchestrate prompts and tools. Functions are thin wrappers for deployment.
- **Genkit Developer UI**: `npm run dev` launches the built-in Genkit playground for local testing.

## Tech Stack
- TypeScript 5.8 (strict), Node.js 20+
- Genkit 1.x + @genkit-ai/google-genai + @genkit-ai/vertexai + @genkit-ai/firebase
- Firebase Cloud Functions v2 + Firebase Admin SDK
- Zod for runtime validation
- Vitest for testing, ESLint 9, Prettier

## Commands
```bash
npm run dev          # Genkit Developer UI + hot reload
npm run build        # TypeScript compile to dist/
npm run serve        # Run directly with tsx
npm run typecheck    # TypeScript check only
npm run test         # Vitest
npm run lint         # ESLint
npm run format       # Prettier
```

## Environment Variables
```
GOOGLE_GENAI_API_KEY    — Google AI API key (required for dev)
GOOGLE_CLOUD_PROJECT    — GCP project ID (required for Vertex AI / production)
GOOGLE_CLOUD_LOCATION   — GCP region (default: us-central1)
GENKIT_ENV              — "dev" | "production" (controls which AI plugin is used)
```

## Conventions
- Path alias: `@/` → `src/`
- Tests in `__tests__/` mirroring `src/` structure
- Conventional commits enforced via commitlint
- All `.js` extensions in imports (NodeNext resolution)
- Schemas centralized in `src/schemas/`, not co-located with flows
