# Why the Site Felt Heavy — Real-User Performance Report

Date: 2026-09-25 · Scope: public site in Chrome, development (`next dev`, :3000) and production (`next start`, :3200)

All numbers are **local measurements** on this machine: Playwright-driven Chromium using the machine's AMD Radeon GPU through D3D11, unless marked otherwise. They are diagnostic, not field Core Web Vitals. The earlier lab report (`final-report.md`) remains valid for what it measured.

Evidence is in `.artifacts/performance/ux/` (journey, trace, A/B and profile JSON, logs, screenshots).

---

## Real root causes, ranked by measured impact

| # | Cause | Measured impact before | Status |
|---|---|---|---|
| 1 | **CMS outage handling.** `ENOTFOUND` plus the SDK's 1 s/2 s/4 s retry backoff held **every CMS-backed route** (Home, Work, case study, Services, Technologies, Insights: 6 of 9 public routes) for about 7 s on **every visit**. The case study then showed a **false 404**, after 7.1 s with **no visible reaction to the click**. | Navigation: 7.1–7.3 s per CMS route (production), 7.3–8.3 s (dev) | **Fixed** |
| 2 | **Home hero `SystemField` dot (SVG SMIL `animateMotion`).** It repainted and re-rastered the whole diagram layer every frame, which kept about half a CPU core busy while the page sat idle. It also kept running offscreen. | GPU process 32.7% + renderer 18.2% of a core, idle at the top; renderer 10.3% idle mid-page | **Fixed** (visually identical) |
| 3 | **First WebGL context creation after a client navigation.** A one-time 290–307 ms `getContext('webgl2')` stall when the first new page's PixelBlast hero mounts. Later navigations cost 4–21 ms. | One ~0.3 s hitch per session | Not changed (see Main thread) |
| 4 | **Dev-mode overhead** | +0.1–0.4 s per navigation; about 113 KB of unminified chunks on first visits | Development only |

PixelBlast was **not** a material cause. That's shown below, and it corrects the previous report's implication.

## Development vs production

- You were on `next dev`: port 3000, PID 24516, launched with `npm run dev`. It was left running.
- **Most of the heaviness was not development-specific.** Cause 1 behaves the same in production. Total response time per CMS route was 7.13–7.25 s in production and 7.35–8.35 s in dev. Static routes took 6–10 ms in production and about 1.0 s in dev.
- Dev adds a smaller, separate cost: 0.1–0.4 s more before the URL changes, and larger unminified chunks. For example, the first Contact visit loaded 113 KB of scripts in dev, and Contact took 511 ms in dev versus 92 ms in production.

## Navigation (click → content), before vs after

Hardware GPU, desktop 1440. "Complete" means no route loading placeholder remains.

| Click | Prod before | Prod after | Dev before | Dev after |
|---|---|---|---|---|
| Home → Work | URL 50 ms, content **7,170 ms** | URL 30 ms, content **92 ms** | 7,354 ms | 168 ms |
| Work → case study | **no reaction for 7,137 ms, then 404** | URL 110 ms, content **491 ms**, renders | 7,335 ms, **404** | 635 ms, renders |
| Work → Contact | 92 ms | 74 ms | 511 ms | 236 ms |
| Contact → Home (lower sections) | 7,099 ms | 343 ms | 7,302 ms | 460 ms |
| Home hard load, `load` event | 7,420 ms | 159 ms* | 7,419 ms | 7,561 ms* |

\* After the outage is detected. The first request after a server start or hot reload still gets the SDK's full retries, by design (see CMS retries).

Diagnostic only, production after, 4× CPU slowdown plus slow 4G: every navigation completed in **≤ 819 ms**. Mobile 390 production after: the case study appeared in 205 ms.

Server response totals, production, during the outage (`route-timing-after.txt`): CMS routes **7.1–7.3 s → 63–101 ms**.

## Main thread

Long tasks over 50 ms and their owners (CPU profiles `profile-*.cpuprofile`, `interactions.json`):

| Where | Long task | Owner |
|---|---|---|
| First client navigation (e.g. Home → Work) | 305–335 ms, once | `HTMLCanvasElement.getContext('webgl2')`: native context creation for the destination's PixelBlast hero. Later navigations: 4–21 ms. |
| Case-study hard load | 127 ms | Hydration: Turbopack runtime 63 ms, three.js 45 ms, React 43 ms |
| Demo tabs ×6 + booking dialog | 71 ms max | Demo chunk (`3jhzcm…`, 76 ms total JS) and React |
| Home wheel-scroll, 7 s | none | 142 ms JS total (Motion 49 ms, React 40 ms, in-view reveals) |
| Pointer over the hero, 4 s | none | 44 ms JS |
| Mobile menu open/close ×3 | none | 80 ms JS |

- **No re-render storms were found.** Scrolling, pointer movement, the menu and demo tabs all stay well under frame budget, so no memoization was added.
- **The architecture diagram (and its 27.6 KB Zod) is not material:** it isn't among the top JS owners during case-study load or interaction. Left alone.
- **The first-navigation `getContext` stall was not changed.** It occurs only once per session, and a micro-benchmark on the same GPU creates contexts in 4–24 ms, so the cost is Chrome/ANGLE warm-up. Removing it would mean keeping one WebGL context alive across routes, which conflicts with the verified "route transitions release every previous context" behavior.

## GPU / PixelBlast

- **PixelBlast is not a material contributor.** On hero routes without the SMIL dot (Work, Services, Contact, About), the whole idle page costs about 3.5–4% GPU-process CPU.
- Shader time on the GPU is **0.87 ms per draw** at DPR 1 and 1.63 ms at the DPR 1.5 cap, measured with timer queries.
- Each frame makes **9 WebGL calls**.
- **Lowering its frame rate from about 22 to 10 draws per second changed nothing** (32.1% → 31.9%).
- The earlier "animated vs reduced motion" comparison was confounded. Reduced motion also removed the SMIL dot, and region bisection moved the cost to the hero diagram (`bisect-home.json`, `packet-ab.json`).
- PixelBlast already caps DPR (1.5 desktop, 1 mobile), caps frame rate at 30 fps, pauses when hidden or offscreen, and draws a static field under reduced motion. **Not changed.**
- **Header `backdrop-filter` and the hero `mask-image`:** disabling each moved idle cost by only 1–2 points (`effects-ab-home.json`). Not changed.
- **The ticker** (a composited `transform` animation): about 1 point. Not changed.
- **Technologies `drift`:** 19 composited `transform` animations, 5–11% GPU-process CPU while visible, paused by design otherwise. Not changed.
- **Headless SwiftShader warning:** default headless Chromium renders WebGL in software, which saturated the main thread in earlier runs. All conclusions here use the hardware GPU.

## CMS / 404 — why `/en/work/relax-moon-spa-automation` showed 404

**Verdict: the CMS DNS failure was being translated into a 404.** It was not missing content and not a routing defect.

The chain was:
1. The URL matched `app/[locale]/work/[slug]/page.tsx` with slug `relax-moon-spa-automation`.
2. The page called `getPublishedCaseStudy(slug)`, which queried `projects` by slug.
3. The fetch failed with `ENOTFOUND`, and the SDK retried at 1 s, 2 s and 4 s. The query then returned `{ error }`.
4. `if (error || !p) return null` treated a failed read the same as "no such record".
5. The page ran `if (!data) notFound()`, which produced the 404.

Contributing problems found along the way:
- **The query ran twice.** `generateMetadata` and the page each called `getPublishedCaseStudy`, as the trace shows (two parallel `projects` chains).
- **The site contradicted itself.** When the CMS returned nothing, the Work page listed the showcase from its dictionary fallback and linked to it, and the link then 404'd.
- **The click gave no feedback.** The only loading boundary was at `[locale]`, which doesn't re-trigger for Work → Work/[slug], so nothing changed on screen for 7 s.
- **`app/error.tsx` couldn't render here.** It sits above the `[locale]` layout that owns `<html>`/`<body>`.
- **`insights/[slug]` had the same defect.**

What the pages do now:

| Situation | Before | After |
|---|---|---|
| Record genuinely missing (CMS answered, no row) | 404 | **404** (unchanged) |
| CMS can't answer (network, server or query error), showcase slug | false 404 | Renders from the same dictionary entry the Work page already uses. Every other section already had a built-in fallback. **No new content was written.** |
| CMS can't answer, any other case study or insight | false 404 | The existing error UI ("Something did not load correctly." + Try again), inside the site's header and footer |

Server logs now record a `CmsReadError` with a digest. Before, the outage was silent.

## CMS retries

- **Not disabled, and unchanged whenever the CMS is healthy or failing only briefly.** `src/lib/supabase/availability.ts` adds a small breaker for public reads.
  - It opens only after **network-level** failures persist for 3 s or more with no success in between. By then the SDK's retries (0 s, 1 s, 3 s attempts) have already failed.
  - While open, new public reads make **one attempt**, which still probes the CMS, instead of four attempts with 7 s of backoff.
  - **Any HTTP response closes it**, including 503/520, which keep the SDK's own retries.
  - It forgets the outage after 60 s with no failures.
  - Requests aborted by the caller don't count.
- **A 5 s per-attempt timeout** was added, as a `TimeoutError` that the SDK retries like any network failure. This session observed an 8.4 s DNS lookup and a 10.6 s connect timeout. Without it, a stalled attempt waits for the runtime's own limits (10 s connect, 300 s headers).
- **Trade-off:** during a confirmed outage, a read that would have succeeded on a later retry now falls back one request sooner. The first request of each outage still gets the full retries, and the browser test asserts this.
- **Evidence:** `cms-trace-before.jsonl` shows 4 attempts per query per request; `cms-trace-after.jsonl` shows single attempts of 5–53 ms once the outage is detected.

## Prefetch

- **Not a material contributor.**
- After load, Next prefetches visible links: 6–13 requests, about 200–216 KB of route JavaScript at idle priority. For dynamic routes it fetches only the route tree and metadata.
- The server trace shows **no CMS queries caused by prefetch.** They come only from real navigations.
- Not changed.

## Memory

- **No leak.** Three full journeys (Home → Work → case study + 5 dialogs → back → Contact → About → Services → Home), with forced GC at each checkpoint (`memory.json`):
  - JS heap: 5.5 → 8.9 → 9.5 → 9.7 MB (plateau: the router cache of visited routes)
  - Event listeners: plateau at 430
  - Documents: 1
  - Live WebGL contexts: exactly 1 at every checkpoint
- DOM nodes on Home grow by 7 per cycle, which is negligible.

## Changes made

| File | Why | Class |
|---|---|---|
| `src/lib/supabase/availability.ts` (new) | Outage breaker and per-attempt timeout for public CMS reads | Production |
| `src/lib/supabase/server.ts` | `createClient(options)` accepts `db`/`global` options; admin callers are unchanged | Production |
| `src/server/queries/public-content.ts` | Public reads use the breaker. `CmsReadError` separates "can't answer" from "missing". `getPublishedCaseStudy`/`getPublishedInsight` are wrapped in `cache()`, one query per request | Production |
| `src/app/[locale]/work/[slug]/page.tsx` | Missing → 404; read failure → showcase dictionary fallback or error boundary | Production |
| `src/app/[locale]/error.tsx` (new) | Re-exports the existing error UI inside the locale layout | Production |
| `src/app/[locale]/work/[slug]/loading.tsx`, `src/app/[locale]/insights/[slug]/loading.tsx` (new) | Re-export the existing placeholder, so list → detail clicks respond immediately | Production |
| `src/components/motion/system-field.tsx` | Dot moves along the same path at the same constant speed (121 length-paced keyframes, 4.6 s loop) as a compositor `transform` animation; pauses offscreen | Production |
| `src/components/motion/system-field.module.css` | HTML dot sized in SVG units (r = 3) with the same glow | Production |
| `vitest.config.ts` | Alias `server-only` to Next's bundled empty module, so server modules are testable | Test |
| `playwright.performance.config.ts` | Adds the outage server (:3110) and `cms-outage.spec.ts` | Test |
| `tests/fixtures/operations-server.mjs` | `--cms-unreachable` mode | Test |
| `tests/fixtures/cms-unreachable-fetch.mjs` (new) | Test-only: CMS reads fail like `ENOTFOUND` | Test |
| `tests/e2e/cms-outage.spec.ts` (new) | Outage: retries preserved on the first request, then fast; showcase renders (en/ar); unknown slug → error UI, not 404 | Test |
| `tests/unit/cms-availability.test.ts`, `tests/unit/public-content-errors.test.ts`, `tests/integration/system-field.test.tsx` (new) | Regression tests for each fix | Test |
| `.artifacts/performance/ux/*` | Diagnostics and evidence | Performance only |

**Idle cost, Home hero visible** (the same build with the old path forced by injection, alternating runs, `layer-ab-repeat.txt` and `route-idle-final.json`):
- Before: 32.7% GPU process + 18.2% renderer
- After: 13.9% GPU process + 10.3% renderer (en); 15.6% + 11.5% (ar)
- That's about **−52%**.
- Scrolled mid-page, renderer CPU went from 10.3% to 4.8%.

**Visual check:** the dot was compared against the old SMIL version at 5 path times × 3 viewports (1440 en, 390 ar, 768 en). Mean pixel difference was 0.23–0.94 of 255, with the same position, size and glow; only edge anti-aliasing differs (`dot-compare-final.png`).

## Before vs after (summary)

| Measure | Before | After |
|---|---|---|
| CMS-route server response, outage (production) | 7.1–7.3 s | 63–101 ms |
| Home → Work content | 7,170 ms | 92 ms |
| Work → case study | 7,137 ms, then **404** | 491 ms, **page renders** |
| CMS attempts per case-study view | 8 (4 × page + 4 × metadata) | 1 once the outage is known |
| Home idle CPU, hero visible | ≈ 51% of a core | ≈ 24% of a core |
| Home LCP (lab) desktop / mobile | 228 / 152 ms | 176 / 136 ms |
| CLS (Home, Contact, case study; en/ar; 1440/390) | 0 | 0 |
| Transferred JS, Home / Contact | 389,349 / 370,487 B | 390,486 / 371,280 B (+1.1 KB / +0.8 KB) |

## Regression

| Check | Result |
|---|---|
| Browser, production build (`playwright.performance.config.ts`) | **36 / 36 passed**: 20 operations demo + 12 PixelBlast + 4 new CMS-outage |
| Unit + integration (`npm test`) | **31 / 31 passed**: 22 existing + 9 new |
| Lint | **PASS**: 0 errors; the same 3 existing warnings in `homepage.tsx` |
| Typecheck | **PASS** |
| Production build | **PASS** (normal environment; no fixture values in `.next`) |

- The mobile dialog test still passes, including under the outage server.
- **`tests/e2e/visual-responsive.spec.ts` (outside the verified suite) fails and was not modified.**
  - It expects `featured-case-study` on Home, which Home renders only when the CMS returns projects. The `ENOTFOUND` outage removes it.
  - Its later assertion expects one `packet` element under reduced motion. The dot has never rendered under reduced motion, before or after this work.
  - So this spec was already stale. With motion on, the page has exactly one packet.

## Remaining

### Application-controlled
- A one-time ~0.3 s WebGL context stall on the first client navigation (Chrome/ANGLE warm-up). Removing it would require one persistent context across routes.
- Home still idles about 3× higher than other routes while the hero is visible (compositor frames for the moving dot and the ticker). The cost is now compositor-driven and pauses offscreen.
- `tests/e2e/visual-responsive.spec.ts` needs updating for CMS-less rendering and the reduced-motion packet expectation. That's a product decision, so it was left unchanged.
- The breaker state is per server process, so each serverless instance learns about an outage separately.

### External
- **CMS DNS `ENOTFOUND`: unresolved.** The site now degrades quickly and truthfully, but the CMS content itself (projects, services, insights) stays unavailable until the host resolves.

## Measurement limitations
- Local lab and diagnostic measurements on one Windows machine (AMD Radeon, D3D11) with Playwright-driven Chromium. **Not** field Core Web Vitals.
- CPU percentages are per-process CPU time from Chrome's process table, and vary ±1–2 points between runs. Key comparisons were repeated and alternated.
- Throttled runs (4× CPU, slow 4G) are diagnostic only.
- Mobile journey times that start at the menu button include the menu's 0.3 s open animation.
