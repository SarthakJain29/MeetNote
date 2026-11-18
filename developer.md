# developer.md

## 1. Audit of the original project

**What it was meant to be:** an "AI Meeting Summarizer" — paste a transcript, get a summary + action items, save it, browse history.

**Original stack:** Next.js 16 (App Router, JavaScript), Tailwind 3, OpenAI SDK, Supabase.

| Area | State | Problems found |
|---|---|---|
| Summarize API | Half works | Hard-wired to OpenAI `gpt-3.5-turbo` (paid, no free tier); no input validation; no error handling; `dotenv` imported inside a Next route (unneeded) |
| Structured output | Broken by design | The model returned free text, and the client *regex-guessed* key points and tasks from bullet lines/keywords ("task", "assign"). Fragile and often wrong |
| Persistence | Broken | `@supabase/supabase-js` was **not in package.json**; `supabaseClient.js` would crash on import; the `meetings` table schema was undocumented; anon key used for server writes; no auth |
| Error handling | Poor | `alert()` for errors; History page swallowed errors and showed "empty" |
| UX | Basic | Generic Tailwind template look, no skeletons, no task interactivity, no search, no detail page |
| Tooling | Broken | `eslint.config.mjs` imported the TypeScript config but the project had no TypeScript; no tests; no `.env.example`; `.gitignore` ignored all `.env*` |
| Docs | None | README was the create-next-app boilerplate |

**Verdict:** a skeleton that could not run end-to-end without a paid OpenAI key *and* an undocumented Supabase project.

## 2. Research (what good meeting-note products do)

Sources: [TechRepublic roundup](https://www.techrepublic.com/article/news-best-ai-meeting-note-takers-2026/), [Granola's comparison](https://www.granola.ai/blog/meeting-note-tool-pricing-granola-vs-fireflies-fathom-otter), [index.dev comparison](https://www.index.dev/blog/otter-vs-fireflies-vs-fathom-ai-meeting-notes-comparison), and the visual language of [vibrant.design](https://vibrant.design/).

- **Otter.ai** – transcript-first, speaker labels, searchable archive, live collaboration → I added speaker parsing, talk-time, library search.
- **Fireflies.ai** – strong on structured outputs and "ask your meetings" Q&A, plus cross-meeting tracking → I added *Ask this meeting* and a cross-meeting **Tasks** board.
- **Fathom** – wins on a generous free tier and instant, scannable summaries with action items → zero-cost, zero-setup (mock mode) + instant results.
- **Granola** – notes feel personal and private, the product stays out of the way → local-first storage; minimal UI.
- **vibrant.design** – bold dark canvas, saturated gradients, large confident type, soft glass surfaces → the visual direction (violet→fuchsia→amber gradient on near-black, aurora glow, glass cards, pill nav).

## 3. Decisions

1. **Migrate to TypeScript.** The core data (analysis JSON from an LLM) is exactly where types + runtime validation (zod) pay off. The old ESLint config already assumed TS.
2. **Keep Next.js 16 + Tailwind 3.** Right tool already; no reason to churn.
3. **Provider abstraction** (`src/lib/ai`): `AIProvider { analyze, ask }` with Gemini, Groq, and a heuristic Mock. `AI_PROVIDER=auto` picks the first configured key; failures cascade Gemini → Groq → Mock with a visible warning. Raw `fetch` instead of SDKs (fewer deps, easier to test with a stubbed `fetch`).
4. **Structured JSON from the model** (validated by zod in `schema.ts`) replaces regex guessing. Output is normalised (priorities, sentiment, caps on list sizes) so a messy model can't break the UI.
5. **Dropped Supabase → local-first browser storage.** It needed an account + SQL setup + auth to be safe (anon key writes to a shared table is a real privacy problem). localStorage is free, private, zero-config; `storage.ts` is isolated so a DB-backed store can be swapped in (roadmap). Trade-off: data is per-browser.
6. **Dropped OpenAI.** Not free; Gemini and Groq both have free tiers.
7. **Default models:** `gemini-flash-latest` and `openai/gpt-oss-120b`. While testing I found `gemini-2.0-flash`, `gemini-2.5-flash` retirement/availability and Groq's `llama-3.3-70b-versatile` no longer served — model names churn, so defaults use an alias and everything is overridable via `GEMINI_MODEL` / `GROQ_MODEL`.
8. **System fonts**, not `next/font/google`, so builds work offline/sandboxed and there's no font layout shift.
9. **No auth, no rate limiting** on the API routes — acceptable for a local/demo app; listed under known issues.

## 4. Setup

```bash
npm install
cp .env.example .env.local   # optional – leave keys blank for mock mode
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev | build | start | lint | typecheck | test`.

### Environment variables (all optional)

| Var | Where to get it | Notes |
|---|---|---|
| `AI_PROVIDER` | – | `auto` (default), `gemini`, `groq`, `mock` |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey (free) | |
| `GEMINI_MODEL` | – | default `gemini-flash-latest` |
| `GROQ_API_KEY` | https://console.groq.com/keys (free) | |
| `GROQ_MODEL` | – | default `openai/gpt-oss-120b` |

No keys → mock mode (offline heuristics). Never commit `.env*` (only `.env.example` is tracked).

## 5. Deploy (free)

**Vercel Hobby:** import the GitHub repo → framework auto-detected as Next.js → add `GEMINI_API_KEY` and/or `GROQ_API_KEY` in Project Settings → Environment Variables → Deploy. No other infra is needed (storage is in the browser). Netlify/Cloudflare Pages also work with their Next.js adapters.

## 6. Known issues / limitations

- Library data lives in one browser's localStorage (no sync, ~5 MB cap).
- Mock mode is heuristic: it works best with `Name: text` lines and explicit commitments ("I'll…", "by Friday"); it is not an LLM.
- API routes have no auth/rate limit — if you deploy publicly with your key, someone could burn your free quota. Add a limiter (e.g. Upstash free tier) first.
- Free-tier LLMs return 429/503 at times; the app falls back and says so.
- Audio transcription is out of scope (text transcripts / .vtt / .srt only).
- Transcript cap: 60,000 characters.

## 7. Blockers & workarounds

| What failed | Tried | Outcome / what you need to do |
|---|---|---|
| `gemini-2.0-flash` and `gemini-2.5-flash` returned 404 "no longer available" | Listed models via the API (`/v1beta/models`) | Switched default to the `gemini-flash-latest` alias. Gemini was intermittently 503/429 (high demand/quota) during testing — cascade to Groq/mock handled it. Nothing needed. |
| Groq `llama-3.3-70b-versatile` absent from model list | Listed models | Default changed to `openai/gpt-oss-120b`; verified live. |
| `next/font/google` can't be assumed offline | – | Used system fonts. |
| Live Gemini analysis never succeeded (retried after keys were updated) | One live call through the app + one direct API call | Both returned `429 RESOURCE_EXHAUSTED`: free-tier limit of 20 generate_content requests/day for the `gemini-flash-latest` alias (currently `gemini-3.8-flash`), resets in ~11h. The Gemini client code is covered by stubbed tests, but is unverified live. The app fell back correctly. **You:** retry after the quota resets, or use a key from a project with unused quota, or set `GEMINI_MODEL` to another flash model. Groq is verified live. |
| Screenshots | Playwright against the real app | Captured in `docs/`. Re-capture after UI changes. |

## 8. Progress

**Done:** audit · research · TS migration · provider abstraction (Gemini/Groq/mock, fallback chain, live-verified) · zod validation · local-first storage · Studio / Library / Meeting detail (Notes, Transcript, Ask, Follow-up) / Tasks board · export to Markdown · file upload (.txt/.vtt/.srt) · loading/empty/error states · 19 unit tests · lint/typecheck/build green · docs · screenshots.

**In progress:** –

**Next (roadmap):** optional Supabase/Turso sync; API rate limiting; audio upload via Groq Whisper; Slack/Notion export; recurring-meeting trend view; E2E tests (Playwright).
