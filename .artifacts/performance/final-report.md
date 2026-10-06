# Performance Pass — Final Report

Date: 2026-09-25 · Scope: public site (Home, Contact, Relax Moon Spa case study) · Build: Next.js 16 production build

All timings below are **local lab measurements** taken against the production build on one Windows machine with headless Chromium. They are not field Core Web Vitals from real users (see §15).

---

## 1. Executive result

| Area | Before | After | Evidence |
|---|---|---|---|
| Home CLS, desktop 1440 | 0.1189 | **0** | `before.json`, `cls-after.json`, `final-confirm.json` |
| Home CLS, mobile 390 | 0.1114 | **0** | same |
| Home LCP, desktop 1440 | 7,908 ms | **596 ms** (confirmation: 228 ms) | `before.json`, `home-streaming.json`, `final-confirm.json` |
| Home LCP, mobile 390 | 7,380 ms | **156 ms** (confirmation: 152 ms) | same |
| Transferred JS, Home 1440 | 454,636 B | **389,349 B** (−65,287 B, −14.4%) | `before.json`, `final-confirm.json` |
| Transferred JS, Contact | 432,907 B | **370,487 B** (−62,420 B, −14.4%) | same |

- The big win is that Home no longer waits on the CMS: the hero now streams without waiting for lower-section CMS queries.
- The layout-shift fix and two bundle reductions (PixelBlast postprocessing, Zod imports) account for the rest.
- The external CMS DNS failure (`ENOTFOUND`) is **not fixed**. It no longer blocks the first view.

## 2. CLS

| Viewport | Before | After |
|---|---|---|
| Desktop 1440×900 | 0.1189 | 0 |
| Mobile 390×844 | 0.1114 | 0 |

- **Root cause:** the route loading placeholder (`src/app/[locale]/loading.tsx`) reserved only `minHeight: 80vh`. Part of the footer was visible while Home loaded, and the footer moved when the page replaced the placeholder.
- **Fix:** the placeholder reserves a full viewport (`minHeight: 100svh`). Nothing else about its geometry changed.

## 3. Home LCP (local production-build lab)

| Viewport | Before | After (streaming sample) | Final confirmation sample |
|---|---|---|---|
| Desktop 1440 | 7.9 s (7,908 ms) | 0.60 s (596 ms) | 228 ms |
| Mobile 390 | 7.4 s (7,380 ms) | 0.16 s (156 ms) | 152 ms |

**Cause of the improvement:** `src/app/[locale]/page.tsx` now renders the static, server-rendered `HomepageHero` immediately. The two CMS queries now run inside a `<Suspense>` boundary (`HomepageContent`) that renders only the lower sections. The hero no longer waits for CMS work it never used.

Stream timing, measured with `hero-stream.mjs` and `home-stream-trace.json`:

| Sample | Hero HTML arrived | Stream completed |
|---|---|---|
| Traced sample (`/en`) | ~118 ms | ~7.5 s |
| Final `/en` | 117 ms | 7,359 ms |
| Final `/ar` | 33 ms | 7,144 ms |

- Stream completion is **not** hero or LCP timing. It is when the lower CMS-dependent sections finish while the CMS host is unresolvable.
- **Invariant confirmed:** hero HTML arrives before the lower CMS work finishes.

## 4. CMS

- The external CMS hostname fails DNS resolution with `ENOTFOUND` in this environment. This is **unresolved** and outside the application code.
- Home still issues the same **two logical queries**: `projects` and `services`, via `src/server/queries/public-content.ts`. Neither was removed or duplicated.
- **Retries come from the SDK default, not app code or Next.js.** `@supabase/postgrest-js` 2.115.0 has `DEFAULT_MAX_RETRIES = 3` with exponential backoff of 1 s, 2 s, then 4 s. So each logical query makes 4 network attempts: 1 initial plus 3 retries.
  - Retries only happen for idempotent methods (GET/HEAD/OPTIONS), and only when the fetch rejects or the server returns 503 or 520.
  - The application never configures `retry`.
  - The backoff (7 s in total) accounts for nearly all of the ~7.4 s stream completion. The failed DNS attempts themselves take 3–140 ms each (`cms-timing.jsonl`).
- **Decision: not changed.** The retries protect production against transient 503/520 responses, such as PostgREST schema-cache reloads, and brief network failures. Disabling them would trade real-outage resilience for faster failure of lower sections that no longer block the first view.
- There is no hardcoded CMS data, and no fixture reaches production (verified in §12 and §13).

## 5. CLS across widths

- The earlier broader check (`home-responsive.json`) found only negligible shifts in 3 of 10 cases: en-390 0.00003, en-1440 0.00040, ar-360 0.00046. All were below 0.0005.
- The final run (`home-responsive-final.json`) measured **0 in all 10 cases**: en and ar at 360, 390, 768, 1280 and 1440.

## 6. PixelBlast

- The optional `postprocessing` pipeline is now loaded with `import('postprocessing')` only when `liquid` or `noiseAmount > 0` is set. No current hero preset sets either.
- The build output confirms postprocessing's own code (`BlendFunction`, `EffectMaterial`, `KernelSize`) is absent from the loaded chunks. Only the lazy import call site remains.

| Route | Before | After | Saved |
|---|---|---|---|
| `/en` 1440 | 454,636 B | 450,222 B | 4,414 B |
| `/en` 390 | 451,703 B | 447,265 B | 4,438 B |
| `/en/contact` 1440 | 432,907 B | 428,403 B | 4,504 B |

The canvas still renders (`canvas: true`, state `running`). All 12 PixelBlast browser tests pass, covering presets, reduced motion, WebGL-unavailable fallback, context loss and offscreen pausing.

## 7. Zod

- **Change:** `src/lib/validation/inquiry.ts` and `src/components/architecture/types.ts` switched from `import { z } from "zod"` with `z.object(...)` to named imports (`object`, `string`, `email`, `literal`, `number`, `array`, `enum`, `type infer`).
- **Effect:** the bundler can tree-shake the unused parts of Zod's classic API.
- **Measured reduction: 57,916 bytes of transferred JS on every measured route.** Home went from 447,265 to 389,349 B; Contact from 428,403 to 370,487 B (`home-timing.json` → `named-imports.json`).
- **Semantics preserved:**
  - Only the import form changed; every schema rule is the same (compared against `baseline/inquiry.txt` and `baseline/architecture-types.txt`).
  - At runtime (zod 4.5.4), `z.object === object`, `z.string === string`, `z.email === email`, `z.literal === literal`, `z.number === number`, `z.array === array`, and `z.enum === enum`. These are the same function objects.
  - Unit tests pass 22/22, including validation and architecture tests.
  - A browser check of the Contact form showed empty and invalid input rejected (3 invalid fields, no request sent), and valid input sent exactly once with an unchanged payload shape (`contact-check.json`).
- **No duplicate public Zod bundle:** the remaining `z`-namespace imports (`src/lib/validation/cms.ts` and `project.ts`) are only imported by admin `"use server"` actions.

## 8. Total JavaScript (transferred, same method throughout)

Method: `measure.mjs`, which sums `encodedBodySize` for `script` resources loaded within 2.5 s of navigation on the production server.

| Route | Original | After PixelBlast | After Zod (final) | Total saved |
|---|---|---|---|---|
| `/en` 1440 | 454,636 | 450,222 | 389,349 | 65,287 B (−14.4%) |
| `/en` 390 | 451,703 | 447,265 | 389,349 | 62,354 B (−13.8%) |
| `/en/contact` 1440 | 432,907 | 428,403 | 370,487 | 62,420 B (−14.4%) |
| `/ar/contact` 390 | 432,907 | 428,403 | 370,487 | 62,420 B (−14.4%) |

- For `/en` 1440, 2,957 B of the total is sampling variance. A late-loaded chunk (`3ug6igr7d-4gw.js`) fell inside the 2.5 s window before the CLS change and outside it afterwards. The attributable savings are PixelBlast 4,414 B plus Zod 57,916 B.
- The final rebuild produced identical chunk hashes, so these totals apply to the current build.
- **Case study** (`/en/work/relax-moon-spa-automation`, isolated fixture server): 393,683 B total, of which 240,215 B is referenced by the initial HTML (`case-study-js.json`).

## 9. Test results (final)

| Check | Result |
|---|---|
| Browser, production build (`playwright.performance.config.ts`) | **32 / 32 passed**: 20 operations-demo + 12 PixelBlast |
| Unit (`npm test`) | **22 / 22 passed** (11 files) |
| Lint (`npm run lint`) | **PASS**: 0 errors, 3 warnings that were already present (unused `Arrow`, `fieldThemes`, `startSignals` in `homepage.tsx`) |
| TypeScript (`npm run typecheck`) | **PASS** |
| Production build (`npm run build`) | **PASS**, normal environment, no fixture |

- The original dev-server config (`playwright.operations.config.ts`) could not start in the final run. Another `next dev` for this directory was already running on port 3000, and Next 16 allows only one per directory. I left it running.
- The same 20 operations tests are part of the 32/32 production run above.

**Mobile dialog test.** The earlier diagnosis (smooth scrolling) was not correct. The actual cause:
- The search input kept focus while Playwright's element screenshot, taller than the viewport, scrolled the page.
- On the next click, moving focus from the input to the record made Chromium jump the scroll by about 424 px, instantly and in one event, between `pointerdown` and `pointerup`.
- Evidence: forcing `scroll-behavior:auto` did not help, and a rAF scroll-stability wait could not detect a jump that happens only on input.
- Real-user wheel scrolling with the input focused, followed by a click, opened the dialog every time. This is a harness interaction, not an application defect.
- The fix (test-only, `capture()` in `operations-demo.spec.ts`) blurs the focused element before the screenshot, then restores focus with `preventScroll: true`. There are no sleeps.
- Verified 6/6 (en and ar at 390, each run 3 times), then 32/32 twice. Production smooth scrolling is unchanged.

## 10. Responsive

- Home, en and ar: 360, 390, 768, 1280, 1440. No overflow, stable hero geometry through loading, CLS 0, no page errors (`home-responsive-final.json`, `final-home-*.png`).
- Operations demo, en and ar: 1920, 1440, 1366, 1280, 1024, 768, 430, 390, 375, 360. No overflow, dialogs usable (Playwright).
- Contact: en 1440, ar 390.

## 11. Visual regression

- **Hero unchanged.** The hero `<section>` JSX is identical to the saved baseline (ignoring indentation from the extraction), and exactly one hero renders.
- **PixelBlast visible**: the canvas is present and running at every width tested.
- **Arabic correct**: RTL layout and Arabic copy render correctly.
- **English correct.**
- **Dialogs usable**: open, assignment, confirm, Escape and focus return all pass.
- **No horizontal overflow** in any check.

## 12. Network

- The Playwright suite aborts and records any request matching Supabase, n8n, webhooks, WhatsApp/Graph, or Google APIs/Calendar/Sheets, and any non-GET/HEAD/OPTIONS request. **No unexpected requests were recorded** (`forbidden` empty in all 20 operations tests).
- The Contact check intercepted its single POST in the browser, so nothing reached `/api/inquiries` or the CMS.
- Server-side CMS reads in tests go only to the local read-only fixture (`127.0.0.1:3101`), without credentials.

## 13. Files changed

| File | Why | Class |
|---|---|---|
| `src/app/[locale]/loading.tsx` | `80vh` → `100svh` placeholder (CLS fix) | Production |
| `src/app/[locale]/page.tsx` | Render `HomepageHero` first; CMS queries in `<Suspense>` `HomepageContent` | Production |
| `src/components/sections/homepage.tsx` | Hero extracted to exported `HomepageHero` (JSX unchanged); `showHero` prop | Production |
| `src/components/backgrounds/pixel-blast/pixel-blast.tsx` | `postprocessing` loaded lazily only when an effect is enabled | Production |
| `src/lib/validation/inquiry.ts` | Named Zod imports (tree-shaking) | Production |
| `src/components/architecture/types.ts` | Named Zod imports (tree-shaking) | Production |
| `tests/e2e/operations-demo.spec.ts` | `capture()` blurs, screenshots, then restores focus (replaced the ineffective rAF wait) | Test-only |
| `tests/fixtures/production-cms-fetch.mjs` | New. Loaded with `--import` into the test server only: redirects build-embedded `*.supabase.co` `/rest/v1/` GETs to the local fixture, strips credentials, rejects writes | Test-only |
| `tests/fixtures/operations-server.mjs` | `--production` mode: `next start` with the fixture preloaded | Test-only |
| `playwright.performance.config.ts` | Production-build suite (operations + PixelBlast) | Test-only |
| `next-env.d.ts` | Regenerated by Next (`.next/types` vs `.next/dev/types`) | Framework-generated |
| `.artifacts/performance/*` | Measurement scripts, logs, JSON, screenshots, this report | Performance evidence |

Fixture isolation:
- Nothing in `src/`, `next.config.ts`, `package.json` or `scripts/` references the fixture.
- The build output contains no `127.0.0.1:3101`, `demo-only` or fixture filename.
- The normal build passes with no test environment variables.
- Next.js embeds `NEXT_PUBLIC_*` at build time, which is why the fixture intercepts in the test server process instead of changing the environment.

The final review found no debug logging, disabled lint or TypeScript checks, fixed sleeps in tests, secrets, duplicated CMS queries or design changes. Nothing was committed or pushed. The repository has no commits yet, so changes were identified against the saved baselines in `baseline/` and file timestamps.

## 14. Remaining bottlenecks

### Application-controlled
- **Zod core on the case-study route (27,577 B).** `ArchitectureDiagram` is a client component that calls `architectureSchema.parse` during render. That puts Zod core in the case study's initial JS, even though the diagram is about 9,100 px below the fold. Moving validation to the server would remove it, but the component is also used by the admin structure editor, and further Zod work was out of scope. Not changed.
- **three.js for PixelBlast (~138 KB transferred, 2 chunks).** Already `next/dynamic` with `ssr:false`. It loads after hydration and not under reduced motion. It's needed for the above-the-fold effect, so no further change.
- **Contact route chunks on Home.** The form and Zod chunks load on Home only through Next's `<Link>` prefetch of `/contact`. They are not in the initial HTML, and they make navigating to Contact instant. This is intended framework behavior.
- **Commercial demo (13,937 B).** Too small to justify code-splitting and the layout risk. Not changed.
- **Runtime.** With a hardware GPU (AMD Radeon, D3D11), Home, Contact and mobile all hold 60 fps. Main-thread time is about 0.7 s per 5 s on Home whether the canvas runs or is paused, so the canvas adds almost nothing. Contact is 0.14 s per 5 s. The one continuous CSS animation (the ticker, `transform`) costs about 40 ms per 5 s. PixelBlast already caps DPR (≤2), caps frame rate at 30 fps, pauses when hidden or offscreen, and uses a static field under reduced motion. No change is warranted.
- **Fonts.** System font stacks only (Latin: Helvetica Neue/Segoe UI/Arial; Arabic: Tahoma/Arial). 0 font bytes transferred and no effect on LCP.

### External dependencies
- **CMS DNS `ENOTFOUND`.** Unresolved. Lower Home sections finish streaming at about 7.1–7.5 s during the outage, driven by the SDK's default retry backoff (§4). The hero is unaffected.

## 15. Measurement limitations

- All timings are **local lab measurements**: production build, `next start` on localhost, headless Chromium, one machine, no network throttling or CPU slowdown. They are **not** field Core Web Vitals and do not guarantee real-user performance.
- Final LCP and CLS come from a single confirmation sample. Earlier samples were consistent (Home LCP 144–596 ms after the fix).
- Byte totals depend on a 2.5 s capture window, so late prefetches can shift route totals by a few KB (§8).
- Default headless Chromium uses SwiftShader (software WebGL), which saturates the main thread under the canvas (`runtime-swiftshader.json`). Runtime conclusions use the hardware-GPU run (`runtime-gpu.json`).
- CMS-dependent timings reflect a DNS failure, not a healthy CMS.
