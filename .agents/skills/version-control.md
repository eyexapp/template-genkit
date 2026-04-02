---
name: version-control
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - git
  - commit
  - ci
  - deploy
  - firebase
---

# Version Control — Firebase Genkit

## Commits

- `feat(flows): add document analysis flow`
- `fix(prompts): improve summarize accuracy with few-shot`
- `tool(search): add vector search tool`

## CI Pipeline

```bash
npm ci
npx tsc --noEmit
npx vitest run
firebase deploy --only functions
```

## Firebase Deploy

```bash
# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:summarize
```

## .gitignore

```
node_modules/
lib/
.env
*.local
```

## Environment

```bash
# .env (local development)
GOOGLE_API_KEY=your-api-key
GCLOUD_PROJECT=your-project-id

# Firebase Functions config (production)
firebase functions:secrets:set GOOGLE_API_KEY
```

## Prompt Versioning

```
prompts/
├── summarize.prompt           ← Current version
├── summarize.v1.prompt        ← Previous version (archived)
```

Track prompt changes in commits — prompts are code.
