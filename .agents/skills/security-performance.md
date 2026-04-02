---
name: security-performance
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - security
  - performance
  - rate limit
  - token
  - cost
  - auth
---

# Security & Performance — Firebase Genkit

## Performance

### Token Management

```typescript
// Configure max tokens to control cost
const { text } = await ai.generate({
  prompt: input,
  config: {
    temperature: 0.3,
    maxOutputTokens: 1024,  // Limit response size
    topP: 0.95,
  },
});
```

### Caching Responses

```typescript
import { getFirestore } from "firebase-admin/firestore";

async function cachedGenerate(key: string, generateFn: () => Promise<string>) {
  const db = getFirestore();
  const cached = await db.collection("ai-cache").doc(key).get();

  if (cached.exists) {
    const data = cached.data()!;
    if (Date.now() - data.timestamp < 3600000) return data.result;
  }

  const result = await generateFn();
  await db.collection("ai-cache").doc(key).set({ result, timestamp: Date.now() });
  return result;
}
```

### Streaming for Long Outputs

```typescript
const { stream } = await ai.generateStream({
  prompt: "Write a detailed analysis...",
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

## Security

### Auth Policy (Cloud Functions)

```typescript
import { onCallFlow } from "@genkit-ai/firebase/functions";

export const summarize = onCallFlow(
  {
    name: "summarize",
    authPolicy: (auth, input) => {
      if (!auth) throw new Error("Unauthenticated");
      if (!auth.email_verified) throw new Error("Email not verified");
    },
  },
  summarizeFlow
);
```

### Input Sanitization

```typescript
// Zod schemas validate + sanitize all input
const InputSchema = z.object({
  content: z.string()
    .min(1)
    .max(50000)
    .transform(s => s.trim()),
  // Prevent prompt injection via strict enums
  format: z.enum(["bullet", "paragraph", "json"]),
});
```

### Prompt Injection Prevention

- Validate all user input with Zod before passing to prompts.
- Use strict enums for format/mode parameters.
- Separate system instructions from user content in prompts.
- Never interpolate raw user input into system prompts.

### API Key Management

```typescript
// Use Firebase secrets, not env vars
import { defineSecret } from "firebase-functions/params";
const apiKey = defineSecret("GOOGLE_API_KEY");

export const fn = onCall({ secrets: [apiKey] }, async (request) => {
  // apiKey.value() available inside function
});
```

### Cost Controls

- Set `maxOutputTokens` on all generate calls.
- Implement per-user rate limiting in auth policy.
- Cache frequent identical requests.
- Use cheaper models (flash) for simple tasks.
