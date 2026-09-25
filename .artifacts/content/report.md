# Arabic Typography + Content Depth — Report

Date: 2026-09-25 · Production build, local measurements (not field data).

Evidence is in `.artifacts/content/`:
- `metrics-*.json`: LCP, CLS, JS and fonts per route
- `type-audit-*.json`: the font actually rendered per Arabic text node
- `shots/`, `sections/`: screenshots
- `playwright-final.log`, `vitest.log`

> **Concurrent work.** Another editor worked in this repository during this task: the Process page, the navigation dock (`QuickDock`, `Dock.*`), the dictionaries (`en.ts`, `ar.ts`, `types.ts`) and the `motion` upgrade 13.2 → 13.4.4 in `package.json`. None of those files were changed here. Their changes are included in the builds and measurements below.

## Typography

**How Tajawal is loaded**
- It's self-hosted: `public/fonts/tajawal/tajawal-arabic-{400,700}-v12.woff2` (Google Fonts' Arabic subset, 8.9 KB and 9.0 KB), with `OFL.txt` (SIL OFL 1.1).
- `@font-face` rules in `globals.css` use `font-display: swap` and a `unicode-range` covering Arabic plus U+0020 and U+00A0. Both characters are in the file.
- In `[locale]/layout.tsx`, React's `preload()` fetches the files **only when the locale is Arabic**.
- `next.config.ts` serves `/fonts/*` with `Cache-Control: public, max-age=31536000, immutable`.

**Why not `next/font`**
- `next/font/google` was implemented first and measured. It cannot exclude Tajawal's Latin subset.
- Those Latin faces (which cover the space and full stop) arrived after first paint and re-wrapped Arabic headings. Measured Arabic CLS was up to 0.138.
- Preloading the fonts through the shared `[locale]` layout sends them to English pages as well.
- The self-hosted version gives Arabic CLS 0 with zero font bytes on English pages.

**Weights**
- Only 400 and 700 are loaded.
- 500 was never used by any Arabic text.
- 800 was used only by a few 750–850 labels on Home; they now render at 700.

**How Arabic and English are separated**
- `--font-arabic: "Tajawal", <Latin stack>` applies only under `html[lang="ar"]`.
- English keeps `--font-latin`, with no changes.
- Latin terms inside Arabic text (n8n, Supabase, API) use the site's existing Latin face.
- In Arabic mode the mono stack is `"SFMono-Regular", Consolas, "Liberation Mono", Tajawal, monospace`, so technical identifiers stay mono.

**Hierarchy (Arabic)**
- h1 and h2: 700, letter-spacing 0
- `.display`: 700, line-height 1.05
- `.heading`: 700, line-height 1.2
- buttons and eyebrows: 700
- body: 400, line-height 1.75
- `.lead`: line-height 1.8
- new section copy: line-height 1.8–1.85

**Arabic-text mono labels in 10 modules** now use Tajawal. Arabic words in the mono stack were taking Consolas's wide space. The modules are homepage, connected-workflow, footer, work, case-study, the booking demo, system-experiences, the operations demo (CSS only), journal and technologies. Latin-only technical labels keep the mono face.

**Logo wordmark** (header and footer) is pinned to the Latin face, so it's identical in both locales.

**Verification**
- Chrome `CSS.getPlatformFontsForNode` reports 100% of rendered Arabic text nodes in Tajawal on all 10 Arabic routes, including the 404.
- One report was a false positive: the Contact field counter "01 /", which is Latin and correctly mono.
- English pages fetch no fonts and render in the same Segoe UI and Consolas as before.
- Letter-spacing: a controlled test showed Chrome ignores tracking on connected Arabic. Headings are still reset to 0 in Arabic mode for other engines.

## Pages enhanced
- Relax Moon case study
- Work
- Technologies
- Services
- Insights
- About
- Contact
- Arabic and English 404, error and loading states

Home was intentionally left unchanged: it's already dense and carries the verified streaming and LCP work.

## Relax Moon

The new sections come only from what the repository shows: the interactive booking demo's flows (including change and cancel), the operations demo's eligibility and status rules, the architecture data and the existing case-study copy. They're framed as the workflow *modelled in this sanitized demonstration*. The repository has no n8n, WhatsApp or Google Calendar integration code.

**Opening**
- Positioning line: "Conversational booking & operations automation / منظومة حجز وتشغيل مؤتمتة عبر واتساب".

**01 Challenge**
- Adds an 8-variable coordination grid: conversation, service, date and time, location (home or hotel), branch (Riyadh and Al Sharqiyah), specialist, changes, records.

**02 Engineering decisions**
- Adds 10 system responsibilities, each labelled **Automated**, **Assisted** or **Manual**.
- Assignment is assisted: the console lists only eligible staff.
- Lifecycle is assisted: staff act, and the system allows only valid transitions.
- Late cancellations are manual: they're referred to customer service.

**03 Security**
- Adds guardrails: guided input, eligibility before assignment, valid transitions only, policy-bound cancellation, server-side boundaries.
- Also states plainly that production error branches are not reproduced in this demonstration.

**04 Workflow**
- The existing 8-stage journey is kept.
- Selecting a stage now opens a detail panel: Input, System action, Decision, Data, Next.
- The Decision field appears only where a rule exists.

**05 Decision logic (new)**
- Six evidenced rules:
  - intent routing (book, change or cancel)
  - completeness before the availability check
  - offered slots only
  - specialist eligibility: same branch, no overlapping booking
  - cancellation only while more than one hour remains
  - valid status transitions
- Booking lifecycle: pending → confirmed → completed, with cancelled as the other end state. Completed and cancelled are final. Changes move the appointment and keep it active.

**06 System in action** — existing.

**07 Operational interface (new)**
- What the console represents, and what can be explored.
- Clearly marked as fictional and in-browser only.

**Commercial demo** — unchanged.

**08 Technical map**
- The existing diagram, plus "what crosses each boundary": five data flows.

**09 Technology responsibilities**
- n8n, WhatsApp Cloud API, Supabase and Google Calendar, each with Layer, Responsibility, the data it handles, and what it talks to.

**10 Capabilities (new)**
- Qualitative only. It states that no performance figures are published.

**CTA**
- Microcopy: "Have a booking or operations process that still runs by hand?"

## Automation depth
- Explicit Automated / Assisted / Manual classification.
- Decision rules rather than lists of API calls.
- The booking state machine.
- Stage-level input → action → decision → data → next.
- Integration boundaries.
- No AI claims were made for Relax Moon, because none are evidenced.

## Architecture
- The Relax Moon diagram is unchanged, with a responsive boundary list added below it.
- **Technologies page:** a new "Every layer has one job" article with 7 layers: Frontend, Backend, Data, Automation, Security, Testing, Deployment.
  - Each layer shows its responsibility; boundary, communication and security are in native `<details>` (keyboard accessible, no JavaScript).
  - Claims describe how this platform is built: server rendering, server-only modules, Zod, honeypot and rate limit, Supabase RLS and roles, Vitest and Playwright in CI, versioned secrets.
  - Observability is omitted because it isn't implemented.

## Other pages
- **Work:** a Project brief with type, problem, what was engineered, what it automates, integrations, engineering, and what to explore.
- **Services:** per-service scope (what we build, the problem it solves, integrations, what you receive), keyed by the service slug, so it also applies to CMS data.
- **Insights:** a positioning line plus a 7-topic journal map. These are topics, not fake articles.
- **About:** three principles added: reliability before novelty, clear boundaries, security by design.
- **Contact:** what to contact us about, what to prepare, and what happens next. No response-time promises. The form is unchanged.
- **System states:**
  - `[locale]/not-found.tsx` plus a `[...rest]` catch-all give each language its own 404 inside the site layout.
  - `[locale]/error.tsx` and `loading.tsx` are bilingual.
  - The loading geometry, which the CLS fix depends on, is unchanged.

## Responsiveness
- 162 checks: 9 pages × 2 locales × 320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920.
- Result: 0 horizontal overflow, 0 console or page errors.
- Fixed an existing mobile bug: stacked journey stages were squeezed into a 3 rem column. This also fixes the Process page's instance.

## Accessibility
- Journey stage buttons have `aria-controls` pointing at a detail region with `aria-live`.
- Layer disclosure uses native `<details>`/`<summary>`, with valid phrasing content only.
- New sections use `dl`/`dt`/`dd` and `ol`/`ul` semantics, with decorative numbers marked `aria-hidden`.
- Mixed-direction terms are wrapped in `<bdi>`.
- The 404 and error pages are localized and keep site navigation.
- The loading label is localized.

## Performance

Before is the start of this task; after is the final build.

| Measure | Before | After |
|---|---|---|
| CLS, all 16 routes × 2 widths | 0 | **0** |
| Arabic fonts | 0 B (system Tahoma) | 2 files, 17,956 B, finished before first paint (34–58 ms) |
| English fonts during page load | 0 | **0** |
| Transferred JS, Home 390 | 390,486 B | 394,576 B (+4.1 KB) |
| Transferred JS, Contact 390 | 371,280 B | 374,624 B (+3.3 KB) |
| LCP median of 7 runs, 390 | — | `/ar` 168 ms, `/en` 188 ms, `/ar/contact` 388 ms, `/en/contact` 392 ms |

**English fonts after load:** on desktop, Next's idle prefetch of the visible Arabic link carries the Arabic preload hint (18 KB, cached permanently), which warms the font for a switch to Arabic.

**JS increase:**
- About 3 KB is mine: the locale-aware 404, error and loading client components, about 1 KB gzipped each.
- At 1440 the total is +7.6–8.3 KB. That also includes the other session's QuickDock chunk (11 KB gzipped) and prefetch timing within the capture window.

**LCP:** Arabic and English show the same bimodal pattern (~150 ms or ~400 ms) on this machine, so it's machine noise rather than a regression. The LCP elements are the unchanged hero headings.

## Tests

| Check | Result |
|---|---|
| Browser, production (`playwright.performance.config.ts`) | **40 / 40**: 32 baseline + 4 CMS outage + 4 new locale/typography tests |
| Unit + integration (`npm test`) | **36 / 36** (15 files; includes the other session's new process test file) |
| Lint | PASS: 0 errors, the same 3 existing warnings in `homepage.tsx` |
| Typecheck | PASS |
| Build | PASS |

The new `tests/e2e/locale-typography.spec.ts` covers:
- Arabic uses Tajawal and fetches only the self-hosted files; English uses no Tajawal and fetches no fonts.
- The localized 404 renders inside the site layout in both languages.
- The journey stage panel shows its fields, and shows the Decision field only where a rule exists.

## Files changed (this task)

| File | Why |
|---|---|
| `src/app/globals.css` | Tajawal `@font-face`, Arabic font variables, Arabic hierarchy |
| `src/app/[locale]/layout.tsx` | Arabic-only font preload. The other editor's `QuickDock` line is preserved. |
| `next.config.ts` | Immutable caching for `/fonts/*` |
| `public/fonts/tajawal/*` (new) | Arabic subset 400 and 700, plus the OFL licence |
| `src/components/layout/header.module.css`, `footer.module.css` | Latin wordmark; Arabic label font |
| `src/content/system-states.ts` (new) | Bilingual 404, error and loading copy |
| `src/app/[locale]/not-found.tsx` (new), `[...rest]/page.tsx` (new) | Localized 404 inside the layout |
| `src/app/[locale]/error.tsx`, `loading.tsx` | Bilingual. Loading geometry unchanged. |
| `src/content/case-studies/relax-moon.ts` (new) | Structured case-study content, EN and AR |
| `src/components/case-study/relax-moon/relax-moon-sections.tsx` (new), `relax-moon.module.css` (new) | Case-study sections |
| `src/components/case-study/customer-journey.tsx`, `.module.css` | Opt-in stage detail panel; mobile layout fix |
| `src/app/[locale]/work/[slug]/page.tsx`, `case-study.module.css` | Wiring, numbering, positioning, CTA microcopy |
| `src/app/[locale]/work/page.tsx`, `work-page.module.css` | Project brief |
| `src/content/engineering-layers.ts` (new), `technologies/page.tsx`, `technologies.module.css` | Engineering article |
| `src/content/service-scope.ts` (new), `services/page.tsx`, `service-list.tsx`, `service-list.module.css` | Service scope |
| `src/components/insights/journal.tsx`, `journal.module.css`, `insights/page.tsx` | Positioning line and topics |
| `src/content/dictionaries/about.ts` | Three principles |
| `src/content/contact-context.ts` (new), `contact/page.tsx`, `contact/contact-context.module.css` (new) | Contact context |
| `homepage.module.css`, `connected-workflow.module.css`, `interactive-booking-demo.module.css`, `system-experiences.module.css`, `operations-demo.module.css` | Arabic-text labels in Tajawal (CSS only) |
| `tests/e2e/locale-typography.spec.ts` (new), `playwright.performance.config.ts` | New tests |

## CMS
- The external CMS hostname still fails DNS resolution (`ENOTFOUND`).
- All new content is static site copy grounded in repository evidence. Nothing hardcodes CMS records.
- The CMS outage handling from the previous task (breaker, false-404 fix) is unchanged and still covered by tests.

## Content needing confirmation from the real system
The repository models these; it does not implement them:
- production failure branches: API or calendar errors, duplicate messages
- real calendar conflict detection
- rescheduling beyond the demo flow
- operations notification channels

Adding real details to the CMS or to `relax-moon.ts` would deepen the reliability section.
