---
name: architecture
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - architecture
  - genkit
  - flow
  - prompt
  - tool
  - firebase functions
---

# Architecture — Firebase Genkit (AI Flow Pipeline)

## Project Structure

```
src/
├── index.ts                    ← Cloud Functions v2 exports
├── flows/
│   ├── summarize.flow.ts       ← defineFlow: schema → prompt → output
│   └── analyze.flow.ts
├── prompts/
│   ├── summarize.prompt         ← Dotprompt templates (.prompt)
│   └── analyze.prompt
├── tools/
│   ├── search.tool.ts          ← defineTool: external API calls
│   └── database.tool.ts
├── schemas/
│   ├── summarize.schema.ts     ← Zod input/output schemas
│   └── analyze.schema.ts
├── plugins/
│   └── custom-plugin.ts        ← Custom Genkit plugins
└── lib/
    ├── genkit.ts               ← Genkit instance + model config
    └── firebase.ts             ← Firebase Admin init
```

## Genkit Instance Setup

```typescript
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.0-flash",
});
```

## Flow Definition

```typescript
import { z } from "zod";
import { ai } from "../lib/genkit";
import { SummarizeInputSchema, SummarizeOutputSchema } from "../schemas/summarize.schema";

export const summarizeFlow = ai.defineFlow(
  {
    name: "summarize",
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `Summarize the following text:\n\n${input.content}`,
      config: { temperature: 0.3 },
    });
    return { summary: text };
  }
);
```

## Dotprompt Templates

```
---
model: googleai/gemini-2.0-flash
input:
  schema:
    content: string
output:
  schema:
    summary: string
config:
  temperature: 0.3
---
Summarize the following text concisely:

{{content}}
```

## Tool Definition

```typescript
export const searchTool = ai.defineTool(
  {
    name: "search",
    description: "Search the knowledge base",
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ results: z.array(z.string()) }),
  },
  async ({ query }) => {
    const results = await searchKnowledgeBase(query);
    return { results };
  }
);
```

## Cloud Functions v2 Export

```typescript
import { onCallFlow } from "@genkit-ai/firebase/functions";

export const summarize = onCallFlow(
  { name: "summarize", authPolicy: (auth) => !!auth },
  summarizeFlow
);
```

## Rules

- schema → prompt → tool → flow → function pipeline.
- Zod for all input/output schemas.
- Dotprompt for reusable prompt templates.
- Tools for external integrations (search, DB, APIs).
- Cloud Functions v2 for deployment.
