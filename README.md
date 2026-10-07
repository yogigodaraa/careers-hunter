# Careers Hunter

[![CI](https://github.com/yogigodaraa/careers-hunter/actions/workflows/ci.yml/badge.svg)](https://github.com/yogigodaraa/careers-hunter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Status: maintenance](https://img.shields.io/badge/status-maintenance%20only-lightgrey)

> **Status: complete — maintenance only.** This project works and stays online, but no new features are planned. Security updates are still applied.

Find companies that hire for your target role in any country or region, then draft a short,
personalised outreach email for each one, grounded in your CV. Bring your own Claude,
OpenAI or Gemini key.

**Live demo:** <https://careers-hunter.vercel.app>

## What it does

1. **Pick a role.** Four presets: AI developer, software engineer, cybersecurity, network engineer (`src/lib/roles.ts`).
2. **Pick a location** (country + optional region) and how many companies (5–50).
3. **Research.** The LLM returns a list of companies with website, careers page, size, industry
   and a one-line reason to approach them. It is told never to invent a careers email.
4. **Draft.** Paste your CV once. For any company, generate a 140–180-word email (subject + body),
   then copy it or open it in your mail client via a `mailto:` link.
5. **Track.** Add companies to a pipeline board: queued → emailed → replied → interview → rejected.

> **Important:** company research comes from the model's own knowledge. There is **no live web
> search**, so results can be outdated or wrong. Always check the company's website before
> you send anything.

## Screenshots

<!-- TODO: add screenshots of the role workspace and pipeline board (use a fake CV) -->
_Coming soon._

## Privacy

| Data | Where it's kept | Where it's sent |
|---|---|---|
| API key | Browser `localStorage` | With each request to this app's `/api/research` or `/api/draft-email` route, which forwards it to the chosen provider |
| CV text | Browser `localStorage` | Only when you draft an email: route → provider |
| Pipeline | Browser `localStorage` | Nowhere |

There is no database and no server-side logging. Clearing your browser storage removes everything.
Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#privacy).

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- No SDKs: LLM calls use plain `fetch` to Anthropic (`claude-sonnet-4-20250514`), OpenAI (`gpt-4o-mini`) and Google (`gemini-2.0-flash`)

## Quickstart

```bash
git clone https://github.com/yogigodaraa/careers-hunter.git
cd careers-hunter
npm ci
npm run dev        # http://localhost:3000
```

No environment variables are needed. You paste your key into the UI.

### Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

There's no automated test suite yet (see the roadmap).

## Project layout

```text
src/
  app/
    page.tsx                 role picker
    roles/[slug]/page.tsx    workspace for one role
    pipeline/page.tsx        pipeline board
    api/research/route.ts    POST → company list (LLM)
    api/draft-email/route.ts POST → {subject, body} (LLM)
  components/                RoleWorkspace, CompanyCard, CVPanel, LLMKeyPanel, PipelineBoard, …
  lib/
    llm.ts                   provider-agnostic `complete()` + JSON extraction
    research.ts / drafts.ts  prompts + response sanitising
    pipeline.ts              localStorage-backed pipeline
    roles.ts                 role presets
```

## Project status

Active. A working MVP.

## Roadmap

- [ ] Unit tests for `extractJson` and the research/draft response sanitisers
- [ ] Optional live web search to verify companies and careers pages
- [ ] Export the pipeline as CSV
<!-- TODO(yogi): add your own roadmap items -->

## License

MIT. See [LICENSE](LICENSE).
