---
name: testing
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - test
  - flow test
  - genkit test
  - mock model
---

# Testing — Firebase Genkit

## Flow Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { summarizeFlow } from "../src/flows/summarize.flow";

describe("summarizeFlow", () => {
  it("should summarize text", async () => {
    const result = await summarizeFlow({
      content: "Long text content here...",
      language: "en",
    });

    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.keyPoints).toBeInstanceOf(Array);
  });
});
```

## Tool Tests

```typescript
import { describe, it, expect, vi } from "vitest";

describe("searchTool", () => {
  it("should return search results", async () => {
    vi.mock("../src/lib/knowledge-base", () => ({
      searchKnowledgeBase: vi.fn().mockResolvedValue(["result1", "result2"]),
    }));

    const result = await searchTool({ query: "test query" });
    expect(result.results).toHaveLength(2);
  });
});
```

## Schema Validation Tests

```typescript
describe("SummarizeInputSchema", () => {
  it("should accept valid input", () => {
    const result = SummarizeInputSchema.safeParse({
      content: "Hello world",
      language: "en",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const result = SummarizeInputSchema.safeParse({
      content: "",
      language: "en",
    });
    expect(result.success).toBe(false);
  });
});
```

## Genkit Developer UI

```bash
npx genkit start -- npx tsx src/index.ts
# Opens http://localhost:4000 — test flows interactively
```

## Rules

- Test schemas independently with `.safeParse()`.
- Mock external services in tool tests.
- Use Genkit Developer UI for interactive flow testing.
- Integration tests run actual flows (requires API key).
- `npx vitest run` for CI.
