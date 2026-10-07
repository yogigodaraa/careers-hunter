# Copilot instructions for Careers Hunter

- **Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind v4. npm with `package-lock.json`. No LLM SDKs: `src/lib/llm.ts` uses `fetch`.
- **Run:** `npm ci`, `npm run dev`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. No tests yet; prefer Vitest for `src/lib/`.
- **Next.js 16 has breaking changes.** Read `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).
- **Architecture:** browser state lives in `localStorage` (key, CV, pipeline). `src/app/api/research` and `src/app/api/draft-email` are stateless proxies. Provider differences are isolated in `lib/llm.ts`.
- **Privacy:** never log or persist CVs, emails or API keys. Never commit personal data.
- **Prompts:** keep the "never invent a careers email" rule in `lib/research.ts`.
- **When reviewing PRs:** flag server-side storage or logging of user data, new third-party calls, and changes to the JSON shapes the UI depends on.
