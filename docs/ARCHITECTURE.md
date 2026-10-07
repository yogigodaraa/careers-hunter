# Architecture

A guided tour of Careers Hunter for someone reading the code for the first time.

## The big picture

```text
Browser (React, localStorage)                    Next.js route handlers            LLM provider
┌──────────────────────────────────┐            ┌─────────────────────────┐       ┌───────────┐
│ RoleWorkspace                    │  POST      │ /api/research           │       │ Anthropic │
│  ├─ LLMKeyPanel  (provider, key) │ ─────────▶ │   lib/research.ts       │ ────▶ │ OpenAI    │
│  ├─ CVPanel      (CV text)       │            │     └─ lib/llm.ts       │ ◀──── │ Gemini    │
│  ├─ FilterBar    (country, …)    │            │                         │       └───────────┘
│  └─ CompanyCard ── "Draft" ───── │ ─────────▶ │ /api/draft-email        │
│                                  │            │   lib/drafts.ts         │
│ PipelineBoard ◀── lib/pipeline   │            └─────────────────────────┘
└──────────────────────────────────┘
```

There's **no database**. The browser owns all state (key, CV, pipeline) in `localStorage`. The
server is a thin, stateless proxy that adds prompts and cleans up responses.

## Modules

### `lib/llm.ts` (one interface, three providers)

`complete(llm, system, user, opts)` hides the differences between providers:

| Provider | Endpoint | Auth | Model |
|---|---|---|---|
| Anthropic | `/v1/messages` | `x-api-key` header | `claude-sonnet-4-20250514` |
| OpenAI | `/v1/chat/completions` | `Authorization: Bearer` | `gpt-4o-mini` |
| Google | `…/models/{model}:generateContent` | `?key=` query param | `gemini-2.0-flash` |

`extractJson(raw)` strips a ```` ```json ```` code fence, or drops any prose before the first `{` or `[`.
Models sometimes wrap JSON like this even when told not to.

**Concept: adapter pattern.** The rest of the app calls `complete()` and never needs to know
which provider is behind it. Adding a provider means touching only this file.

### `lib/research.ts` (find companies)

Builds a prompt from the role preset (`lib/roles.ts`: title + keyword list), location, count
(clamped to 5–50) and an `exclude` list. The exclude list lets "load more" avoid repeats.
The system prompt sets hard rules: only real companies, and **never invent a careers email**
(use `null`). The reply is parsed and passed through `sanitise()`, which drops entries without a `name` or `website` and normalises the rest.

**Limitation to understand:** this is the model's memory, not a search engine. Treat results as
leads to verify.

### `lib/drafts.ts` (write the email)

Sends the company details, role and CV text, with style rules: 140–180 words, one concrete
reference to the company, no clichés, no em-dashes. Expects `{"subject", "body"}` back.

### `lib/pipeline.ts` (track progress)

Plain functions over a `TrackedCompany[]` stored under `careers-hunter.pipeline.v1`. Stages are
`queued → emailed → replied → interview → rejected` (`STAGE_ORDER`).

**Concept: versioned storage keys.** The `.v1` suffix means a future format change can use `.v2`
and migrate, instead of crashing on old data.

### `app/api/*/route.ts` (the server boundary)

Both routes do the same three things: parse the JSON body, validate required fields (400 if
missing, 401 if there's no key), call the `lib/` function, and return JSON or a 500 with the error message.
`maxDuration` is 60 s for research and 30 s for drafting (Vercel function timeouts).

## Privacy

- **Key:** stored in `localStorage` (`careers-hunter.llmKey`) and sent with each request; the routes use
  it for that single upstream call and don't store or log it.
- **CV:** stored in `localStorage` (`careers-hunter.cv.v1`) and sent only to `/api/draft-email` → provider.
- **Pipeline:** never leaves the browser.
- The repository contains **no CVs, emails or personal data** (git history checked 2026-10-07).

## Where to start reading

1. `src/components/RoleWorkspace.tsx`: the page that wires everything together.
2. `src/lib/llm.ts`: how one function talks to three APIs.
3. `src/lib/research.ts`: prompt design and response sanitising.
