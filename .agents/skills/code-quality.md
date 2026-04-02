---
name: code-quality
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - code quality
  - naming
  - zod
  - typescript
  - prompt engineering
---

# Code Quality — Firebase Genkit

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Flow file | `<name>.flow.ts` | `summarize.flow.ts` |
| Prompt file | `<name>.prompt` | `summarize.prompt` |
| Tool file | `<name>.tool.ts` | `search.tool.ts` |
| Schema file | `<name>.schema.ts` | `summarize.schema.ts` |
| Flow name | camelCase | `summarizeFlow` |
| Tool name | camelCase | `searchTool` |

## Zod Schema Patterns

```typescript
// schemas/summarize.schema.ts
import { z } from "zod";

export const SummarizeInputSchema = z.object({
  content: z.string().min(1).max(50000),
  language: z.enum(["en", "tr", "es"]).default("en"),
  maxLength: z.number().int().min(50).max(500).optional(),
});

export const SummarizeOutputSchema = z.object({
  summary: z.string(),
  wordCount: z.number().int(),
  keyPoints: z.array(z.string()),
});

export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;
```

## Prompt Best Practices

```
---
model: googleai/gemini-2.0-flash
input:
  schema:
    content: string
    language: string
config:
  temperature: 0.3
  maxOutputTokens: 1024
---
You are an expert summarizer.

Rules:
- Respond in {{language}}
- Be concise and factual
- Include key points as bullet points

Content to summarize:
{{content}}
```

## Error Handling

```typescript
import { GenkitError } from "genkit";

export const analyzeFlow = ai.defineFlow(
  { name: "analyze", inputSchema, outputSchema },
  async (input) => {
    try {
      const result = await ai.generate({ prompt: buildPrompt(input) });
      return outputSchema.parse(JSON.parse(result.text));
    } catch (error) {
      if (error instanceof GenkitError) {
        throw error; // Let Genkit handle its own errors
      }
      throw new GenkitError("INTERNAL", `Analysis failed: ${error}`);
    }
  }
);
```

## Structured Output

```typescript
const { output } = await ai.generate({
  prompt: "Extract entities from: " + text,
  output: { schema: EntitiesSchema },
});
// output is typed as z.infer<typeof EntitiesSchema>
```
