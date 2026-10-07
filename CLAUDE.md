@AGENTS.md

# CLAUDE.md

## What this is

Careers Hunter: Next.js 16 app that uses a BYOK LLM (Anthropic / OpenAI / Gemini) to list
companies hiring for a role in a location, draft CV-grounded outreach emails, and track them
on a localStorage pipeline board. Walkthrough: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Commands

```bash
npm ci
npm run dev       # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build     # CI runs lint + build via the shared node-ci workflow
```

No test suite yet. `src/lib/llm.ts` (`extractJson`) and the sanitisers in `research.ts` are pure
functions and good first test targets.

## Layout

- `src/lib/llm.ts`: the only place that talks to LLM APIs (plain `fetch`, no SDKs)
- `src/lib/research.ts`, `src/lib/drafts.ts`: prompts + response validation
- `src/lib/pipeline.ts`: localStorage pipeline (key `careers-hunter.pipeline.v1`)
- `src/app/api/*/route.ts`: thin stateless proxies

## Conventions

- `@/` → `src/`. TypeScript strict. Tailwind v4.
- New provider → only `lib/llm.ts` changes. New role → add to `ROLES` in `lib/roles.ts`.
- localStorage keys are prefixed `careers-hunter.` and versioned (`.v1`).

## Do not

- Never store, log or persist CVs, emails or API keys server-side. No database.
- Never commit real CVs or personal data (use obviously fake sample text in tests).
- Don't relax the "never invent a careers email" rule in the research prompt.
