# AGENTS.md — Firebase Genkit AI Orchestration

## Project Identity

| Key | Value |
|-----|-------|
| Framework | Genkit 1.x (Google AI Orchestration) |
| Language | TypeScript 5.8 (strict, ESM) |
| Category | Backend (AI / Cloud Functions) |
| Runtime | Node.js 20+ |
| Deployment | Firebase Cloud Functions v2 |
| AI Providers | Google AI (dev) + Vertex AI (production) |
| Validation | Zod |
| Testing | Vitest |
| Linting | ESLint 9 + Prettier |

---

## Architecture — Schema → Prompt → Tool → Flow → Function

```
src/
├── config/             ← Environment validation + Genkit instance creation
│   ├── env.ts          ← Zod-validated env vars
│   └── genkit.ts       ← Genkit AI instance with plugins
├── schemas/            ← Centralized Zod schemas (all inputs/outputs)
│   └── <domain>.schema.ts
├── prompts/            ← ai.definePrompt() structured prompt definitions
│   └── <name>.prompt.ts
├── tools/              ← ai.defineTool() AI-callable functions
│   └── <name>.tool.ts
├── flows/              ← ai.defineFlow() business logic pipelines
│   └── <name>.flow.ts
├── functions/          ← onCallGenkit() Cloud Function wrappers
│   └── <name>.function.ts
├── index.ts            ← Re-exports all functions + flows
└── __tests__/          ← Vitest tests mirroring src/
```

### Layer Dependency Direction
```
config → schemas → prompts/tools → flows → functions
         (shared)   (AI layer)    (logic)  (deployment)
```

### Strict Layer Rules

| Layer | Can Import From | NEVER Imports |
|-------|----------------|---------------|
| `schemas/` | zod only | prompts, tools, flows, functions |
| `prompts/` | schemas/, config/ | tools, flows, functions |
| `tools/` | schemas/, config/, external APIs | prompts, flows, functions |
| `flows/` | schemas/, prompts/, tools/, config/ | functions |
| `functions/` | flows/, schemas/, config/ | prompts, tools directly |
| `config/` | zod, env | Everything else |

---

## Adding New Code — Where Things Go

### New AI Feature (Full Stack)
1. Define schemas in `src/schemas/<domain>.schema.ts`
2. Create prompt in `src/prompts/<name>.prompt.ts`
3. Create tool if needed in `src/tools/<name>.tool.ts`
4. Create flow in `src/flows/<name>.flow.ts` (orchestrates prompt + tools)
5. Create function in `src/functions/<name>.function.ts` (thin wrapper)
6. Re-export from `src/index.ts`

### New Schema
```typescript
// src/schemas/summary.schema.ts
import { z } from 'zod';

export const SummaryInputSchema = z.object({
  text: z.string().min(1).max(100000),
  maxLength: z.number().int().positive().default(500),
  language: z.enum(['en', 'tr']).default('en'),
});

export const SummaryOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  wordCount: z.number(),
});

export type SummaryInput = z.infer<typeof SummaryInputSchema>;
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;
```

### New Prompt
```typescript
// src/prompts/summarize.prompt.ts
import { ai } from '@/config/genkit';
import { SummaryInputSchema, SummaryOutputSchema } from '@/schemas/summary.schema';

export const summarizePrompt = ai.definePrompt(
  {
    name: 'summarize',
    input: { schema: SummaryInputSchema },
    output: { schema: SummaryOutputSchema },
  },
  async (input) => ({
    messages: [{ role: 'user', content: [{ text: `Summarize: ${input.text}` }] }],
  })
);
```

### New Tool
```typescript
// src/tools/search.tool.ts
import { ai } from '@/config/genkit';
import { z } from 'zod';

export const searchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Search the web for current information',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ results: z.array(z.string()) }),
  },
  async (input) => {
    // Implementation...
    return { results: [] };
  }
);
```

### New Flow
```typescript
// src/flows/summarize.flow.ts
import { ai } from '@/config/genkit';
import { SummaryInputSchema, SummaryOutputSchema } from '@/schemas/summary.schema';
import { summarizePrompt } from '@/prompts/summarize.prompt';

export const summarizeFlow = ai.defineFlow(
  { name: 'summarize', inputSchema: SummaryInputSchema, outputSchema: SummaryOutputSchema },
  async (input) => {
    const response = await summarizePrompt(input);
    return response.output!;
  }
);
```

### New Cloud Function
```typescript
// src/functions/summarize.function.ts
import { onCallGenkit } from 'firebase-functions/https';
import { summarizeFlow } from '@/flows/summarize.flow';

export const summarize = onCallGenkit(
  { cors: true, consumeAppCheckToken: true },
  summarizeFlow
);
```

---

## Design & Architecture Principles

### Schema-First Development
- ALL inputs and outputs start as Zod schemas in `src/schemas/`
- Schemas define the contract — prompts, flows, and functions reference them
- Types are inferred from schemas (`z.infer<typeof Schema>`) — never manually defined

### Flow Composition
```typescript
// ✅ Flows compose prompts + tools into pipelines
const analyzeFlow = ai.defineFlow(
  { name: 'analyze', inputSchema: AnalyzeInputSchema, outputSchema: AnalyzeOutputSchema },
  async (input) => {
    // Step 1: Extract key info
    const extracted = await extractPrompt(input);

    // Step 2: Enrich with tools
    const enriched = await ai.generate({
      prompt: `Enrich this data: ${JSON.stringify(extracted.output)}`,
      tools: [searchTool, databaseTool],
    });

    return enriched.output!;
  }
);
```

### Dual Provider Strategy
- `GENKIT_ENV=dev` → Google AI (API key, suitable for development)
- `GENKIT_ENV=production` → Vertex AI (GCP IAM, production-grade)
- Provider switching is handled in `src/config/genkit.ts` — flows are provider-agnostic

### Thin Function Wrappers
```typescript
// ✅ Functions are ONE-LINE wrappers
export const summarize = onCallGenkit({ cors: true }, summarizeFlow);

// ❌ NEVER put logic in functions — it belongs in flows
export const summarize = onCallGenkit({ cors: true }, async (input) => {
  // DON'T DO THIS — logic goes in a flow
});
```

---

## Error Handling

### Fail-Fast in Flows
```typescript
// ✅ Validate early in flows
const flow = ai.defineFlow(
  { name: 'process', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    // Zod schema validates input automatically
    // Throw if business rule violated:
    if (input.text.length > 100000) {
      throw new Error('Text exceeds maximum length');
    }
    // ...
  }
);
```

### Tool Error Handling
```typescript
// ✅ Tools should catch and return structured errors
export const searchTool = ai.defineTool(
  { ... },
  async (input) => {
    try {
      const results = await externalSearch(input.query);
      return { results, error: null };
    } catch (error) {
      return { results: [], error: 'Search service unavailable' };
    }
  }
);
```

### Graceful AI Response Degradation
- Always use `response.output` with null checks
- Retry transient AI errors (rate limits, timeouts)
- Fall back to simpler models if premium model unavailable

---

## Code Quality

### Naming Conventions
| Artifact | Convention | Example |
|----------|-----------|---------|
| Schema file | `<domain>.schema.ts` | `summary.schema.ts` |
| Prompt file | `<name>.prompt.ts` | `summarize.prompt.ts` |
| Tool file | `<name>.tool.ts` | `search.tool.ts` |
| Flow file | `<name>.flow.ts` | `summarize.flow.ts` |
| Function file | `<name>.function.ts` | `summarize.function.ts` |
| Schema export | PascalCase + `Schema` | `SummaryInputSchema` |
| Flow export | camelCase + `Flow` | `summarizeFlow` |
| Tool export | camelCase + `Tool` | `searchTool` |
| Prompt export | camelCase + `Prompt` | `summarizePrompt` |

### ESM Import Rules
```typescript
// ✅ Always include .js extension (NodeNext resolution)
import { ai } from '@/config/genkit.js';

// ✅ Use @/ path alias
import { SummaryInputSchema } from '@/schemas/summary.schema.js';
```

---

## Testing Strategy

### Test Pyramid
| Level | What | Where | Tool |
|-------|------|-------|------|
| Unit | Schemas, tools, utils | `__tests__/` | Vitest |
| Flow | Flow logic (mock AI) | `__tests__/flows/` | Vitest + Genkit test helpers |
| Integration | Full flow execution | `__tests__/integration/` | Vitest + Genkit Dev UI |

### Schema Testing
```typescript
it('validates valid input', () => {
  const result = SummaryInputSchema.safeParse({ text: 'Hello', maxLength: 100 });
  expect(result.success).toBe(true);
});

it('rejects empty text', () => {
  const result = SummaryInputSchema.safeParse({ text: '' });
  expect(result.success).toBe(false);
});
```

### What MUST Be Tested
- All Zod schemas (valid + invalid inputs)
- All tool implementations (mock external APIs)
- All flow orchestration logic (mock AI responses)
- Error handling paths

---

## Security & Performance

### API Key Management
- Google AI API key → environment variable only (`GOOGLE_GENAI_API_KEY`)
- Vertex AI → GCP IAM (no API key needed, uses service account)
- Never hardcode API keys
- Use App Check tokens for client-callable functions

### Input Validation
- Zod schemas validate ALL inputs at the boundary
- Function inputs sanitized via `onCallGenkit` (Firebase handles auth)
- Tool inputs validated via Zod before external API calls

### Performance
- Streaming for long-running generations: `ai.generateStream()`
- Token usage monitoring via Genkit observability
- Use appropriate model sizes (don't use large models for simple tasks)
- Cache repeated prompt responses where applicable

---

## Commands

| Action | Command |
|--------|---------|
| Dev (Genkit UI) | `npm run dev` |
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Type check | `npm run typecheck` |
| Serve | `npm run serve` |

---

## Prohibitions — NEVER Do These

1. **NEVER** put logic in function files — they're thin wrappers
2. **NEVER** import prompts/tools directly in functions — go through flows
3. **NEVER** define schemas inline in flows — centralize in `src/schemas/`
4. **NEVER** hardcode model names — configure in `src/config/genkit.ts`
5. **NEVER** skip Zod schemas — ALL inputs/outputs must be typed
6. **NEVER** omit `.js` extension in imports — ESM/NodeNext requires it
7. **NEVER** use `any` type — strict TypeScript
8. **NEVER** commit API keys — environment variables only
9. **NEVER** use synchronous operations in flows — all async
10. **NEVER** skip error handling in tools — tools must handle their failures
