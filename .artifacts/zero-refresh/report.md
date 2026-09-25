# Performance Optimization Report: Zero-Refresh Navigation

Date: 2026-09-26.

- **Measurements:** all local, taken on production builds (`next build` + `next start`, port 3200), in Chromium on the machine's AMD GPU unless marked otherwise.
- **Evidence** (`.artifacts/zero-refresh/`):
  - probes: `reload-probe.mjs`, `nav-profile.mjs`, `nav-trace.mjs`, `tabs-probe.mjs`, `mobile-tap.mjs`
  - results: `reload-*.json`, `profile-*.json` / `*.cpuprofile`, logs
- **Nothing was committed or pushed.**

## Root cause

**1. No internal navigation reloads the document.** Measured, not assumed:
- Every link in the header, mobile menu, footer, CTAs, work cards, logo and language switcher is a `next/link`.
- There are no `window.location`, `location.assign`, `router.refresh` or `reload` calls anywhere in the public site.
- A marker placed on `window` survived every click in production and in dev, desktop and mobile, and no click produced a document request.
- The header element stayed the same DOM node on every page change. The exception is switching language, where the locale layout re-renders `<html lang/dir>`, as it should.

**2. What looked like a refresh was every page's WebGL hero being destroyed and rebuilt.**
- Every public page has a PixelBlast hero, and each route created its own WebGL context. Each navigation therefore:
  - destroyed the previous context (`forceContextLoss`, about 240–320 ms of synchronous main-thread work);
  - created a new one and recompiled the shader (`getContext` plus setup, about 150–210 ms);
  - showed the static fallback field until the canvas came back.
- The visual effect was the top of the page "reloading" while the new content appeared.
- The blocked main thread (97–257 ms tasks) made the next click wait.
- A related defect: during the route commit the new hero measures 0×0. The canvas was shrunk to 1×1 and grown back, a 212.8 ms reallocation measured on the Work navigation.

**3. Machines without GPU acceleration rendered the hero in software (SwiftShader).**
- That meant a continuous stream of 60–130 ms main-thread tasks, about 15 per second whenever a hero was visible.
- Every navigation and tap waited behind them.
- Chrome's `failIfMajorPerformanceCaveat` does not flag SwiftShader on Vulkan, so an explicit check was needed.

**4. Development mode (your `npm run dev` on :3000) behaves differently.**
- Routes aren't prefetched, so 4 of 7 header clicks showed the full-viewport loading skeleton ("the page disappears").
- Each click took 121–470 ms on routes already compiled; the first visit to a route adds compile time.
- Production: 23–90 ms, no skeleton.

**5. Every page shipped the whole dictionary.**
- The client `Header` received the full site dictionary (and `ContactForm` did the same on Contact), so every page's payload serialized all copy, including other pages' demo text.
- That's 11–13.5 KB extra in each page's payload and in every prefetch.

**6. Smaller costs:**
- The case study bundled `motion` (about 50 KB gzipped) only through two dead exports.
- The Home hero's module cycle ran forever, even offscreen.
- The Home hero re-sampled its SVG path 121 times, twice, on every visit, in a paint-blocking layout effect.
- The proxy ran a Supabase session refresh on every public request and prefetch, although public pages no longer read cookies.

## Full page refresh
- **Before:** no document reloads (measured). Each navigation rebuilt the page's WebGL hero: a visible fallback flash plus 97–257 ms of main-thread blocking.
- **After:** no document reloads. The hero's WebGL canvas stays alive and moves into the next page's hero; the next page's first frame is not blocked.
- **Root cause:**
  - **File:** `src/components/backgrounds/pixel-blast/pixel-blast.tsx`
  - **Implementation:** one `WebGLRenderer` per component mount, `forceContextLoss()` in effect cleanup, `renderer.setSize()` on 0×0 measurements.
- **Fix:**
  - A module-level shared engine (one context, one shader). Each hero preset is applied as uniforms; `attach` / `detach` moves the canvas.
  - The context is released only after 2 s with no hero attached, and releasing happens at idle.
  - The first engine is built at idle, capped at 600 ms, after the page paints.
  - The canvas buffer is resized only when its size really changes, never to 0×0.
  - Software renderers are refused, and those visitors keep the existing static field.

## Internal navigation
All routes: **PASS**. Home, Services, Work, Process, About, Insights and Contact, desktop and mobile, English and Arabic.

**Full document reload during normal navigation: NO.**

- **Header clicks, two laps:**
  - Before, wall-clock with actionability waits: 553–1,410 ms.
  - After: 38–136 ms on desktop.
  - In-page, click to content: 24–90 ms (desktop GPU), 21–88 ms (software WebGL), 121–575 ms (phone with 4× CPU throttle).
- **Mobile menu taps on slow 4G:** 13–76 ms, all served from prefetch.
- **Back and forward:** 18–23 ms, client-side.

## Interactive tabs
PASS:
- Process stages
- System Flow
- Automation by Design
- Workflow (execution model) and Failure Path
- Feedback Loop
- Customer Journey
- About chain

**Tab causes page refresh: NO.** **Tab causes unnecessary network request: NO.**
- 112 rapid clicks produced 0 network requests and 0 document changes.
- Worst event duration: 16–40 ms on desktop, 40–112 ms on a 4×-throttled phone.
- CLS 0 after one fix: the failure-run controls no longer swap two buttons for one.

## JavaScript
- **Before:**
  - The case study's own JS was 281.5 KB gzipped, including `motion` pulled in through `system-experiences`' dead exports.
  - Home 252.1 KB, Services 243.8 KB, About/Work 187.7 KB.
  - A further 39.6 KB polyfill chunk is `noModule`, so modern browsers never download it.
- **After:**
  - Case study 231.8 KB (−49.8 KB), Home 245.0 KB (−7.1 KB), Services 238.2 KB (−5.6 KB); the others are unchanged.
  - Transferred JS in the first 2.5 s is 5.6–9.6 KB lower on all 36 route and width combinations.
- **Client components reduced:** none were converted. They were already small islands; the header and form now receive only the props they render.
- **Dead code removed:**
  - `motion/hero-system.tsx` and `.module.css`
  - `case-study/whatsapp-demo.tsx` and `.module.css`
  - the `TechnologyOrchestrator` and `KineticStatement` exports
  - 8.8 KB of CSS used only by them
  - the `antialias` prop (no caller set it)
- **Old Dock:** no remnants; the only mention is the test asserting its absence.
- **Heavy dependencies found:**
  - `three`: loaded on demand, one context now.
  - `motion`: now only on Home/Services, where six working animations use it; kept unchanged.
  - `postprocessing`: loaded on demand, used by no preset.
  - `lucide-react`, `zod`, `react-hook-form`: all in use.
- **Heavy dependencies removed or replaced:** `motion` removed from the case study bundle. No packages were removed or added.

## Hydration
- **Large client components found:** none of size. Pages are server components with small islands.
- **Components moved server-side:** none needed.
- **Payload cut instead:** the `Header` and `ContactForm` props shrank each page's payload by 11–13.5 KB.
  - Contact 25.2 → 12.4 KB, Work 27.6 → 14.1 KB, Home 33.1 → 21.0 KB, About 36.3 → 22.9 KB.
- **Small client islands:** kept as they were.
- **Hydration problems:** none (no console or hydration errors on 36 route and width runs).

## Assets
- **Images:** no large raster images on public routes; none changed.
- **Fonts:** already optimal (self-hosted Tajawal, preloaded only for Arabic, immutable cache, no remote fonts); not changed.
- **SVG:** the Home hero path is now sampled once per visit, and the second (ResizeObserver) sampling was removed.
- **Third-party scripts:** none on the public site.

## Animations
- **Expensive animations found:**
  - The per-route WebGL context lifecycle.
  - Software-rendered WebGL.
  - The Home hero's perpetual module cycle.
  - Repeated SVG path sampling.
- **Continuous animations removed:** the software-WebGL hero, which falls back to the static field. The module cycle now pauses offscreen.
- **Offscreen animations paused:** hero rendering, the packet, the module cycle, and the live diagrams (which already stopped offscreen).
- **Mobile menu entrance:** 300 → 180 ms.
- **Reduced motion preserved:** YES (no WebGL context, static field, no demonstrations).

## Network
- **Duplicate requests:** none found.
- **Requests removed:**
  - The Supabase session refresh no longer runs for public requests and prefetches; the proxy now matches only `/admin/*` and `/:locale/insights/:slug`.
  - Tab clicks make no requests (verified).
- **Caching:** unchanged. Static pages (ISR), hashed assets, immutable fonts.
- **Route prefetch:** framework default (`auto`). Static routes prefetch fully; mobile menu links prefetch when the menu opens (measured as ready before the tap).

## Performance
- **Before:**
  - LCP (single samples, last pass): 84–536 ms.
  - INP: NOT MEASURED before.
  - CLS: 0.
  - Navigation: client-side, 27–109 ms to content, then 57–257 ms long tasks from the hero rebuild. Software WebGL: 112–499 ms to content, with continuous jank.
  - Bundle: see JavaScript.
- **After:**
  - LCP (median of 5): desktop 104–196 ms, mobile 100–472 ms.
  - INP proxy (worst event duration in rapid-click runs): ≤ 40 ms desktop, ≤ 112 ms on a 4×-throttled phone.
  - CLS: 0.
  - Navigation: 24–90 ms to content. The only remaining long tasks are Process (70 ms, the first layout of that page's text) and Insights (103 ms, its hero really is a different size).
- **Not changed:**
  - The router's first layout of a newly inserted page on the throttled phone (444 ms on Process). It's the browser's cold text layout, cheap on repeat visits; `content-visibility`, `text-wrap` and `columns` were each tested and made no difference.
  - Mobile at 4× throttle wasn't measured on the original code.

## Production build
- **Build:** PASS.
- **TypeScript:** PASS.
- **Lint:** PASS (0 errors, 2 existing warnings).
- **Console errors:** NONE.
- **Hydration errors:** NONE.

## Tests
- **Production suite:** 127/127, now running on the GPU because headless Chromium's default is software WebGL.
- **Unit:** 37/37.
- **Wider public specs:** 68 passed and 11 failed. These are the same known environmental failures as last pass, on untouched components.
- **Changed tests:** `pixel-background.spec.ts` asserted a fresh context per route (`>= 10`). It now asserts one context for all ten transitions; the "exactly one live" and "all released" checks are unchanged.

## Responsive
PASS at every width and in every locale mode checked. The widths are the 16-width no-overflow test in the suite, the probes at 1440 and 390, and the header layout test at 15 widths.

| 320 | 360 | 390 | 430 | 768 | 1024 | 1440 | 1920 | English | Arabic | RTL |
|---|---|---|---|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Regression

| Check | Result |
|---|---|
| Design preserved | YES |
| Content preserved | YES |
| Routes preserved | YES |
| Animations preserved | YES (the hero keeps running across navigations now) |
| Diagrams preserved | YES |
| Language switching | YES |
| Start a project | YES |
| Back/Forward | PASS |
| Direct URLs | PASS |

## Files changed
- `src/components/backgrounds/pixel-blast/pixel-blast.tsx`: shared WebGL engine, idle first build, idle release, resize guard, software-renderer refusal. Removes 0.4–0.5 s of main-thread work per navigation and the per-route hero flash, and removes the continuous jank on software WebGL.
- `src/components/motion/system-experiences.tsx` and `.module.css`: dead exports and their CSS removed; the local reduced-motion hook. `motion` is out of the case-study bundle (−49.8 KB gzipped).
- `src/components/sections/homepage.tsx`: `ConnectedWorkflow` is imported from its own module. Home no longer bundles the lab's dead code (−7 KB).
- `src/components/motion/system-field.tsx`: module cycle pauses offscreen; path sampled once per visit. Less work on each Home arrival and no background timer.
- `src/components/layout/header.tsx`, `src/app/[locale]/layout.tsx`: the header receives only `nav` + `localeName`. −11 to −13.5 KB per page payload and per prefetch.
- `src/components/forms/contact-form.tsx`, `src/app/[locale]/contact/page.tsx`: the form receives only the contact copy. Contact's payload is halved.
- `src/components/process/execution-model.tsx`: run controls keep their layout while playing. CLS 0 on phones.
- `src/components/layout/header.module.css`: mobile menu entrance 300 → 180 ms. Links are tappable-and-still sooner.
- `src/proxy.ts`: session refresh only for `/admin/*` and insight articles. No Supabase client on public requests or prefetches.
- **Deleted:** `src/components/motion/hero-system.tsx`, `hero-system.module.css`, `src/components/case-study/whatsapp-demo.tsx`, `whatsapp-demo.module.css`. These were unused.
- `tests/e2e/pixel-background.spec.ts`: asserts one shared context.
- `playwright.performance.config.ts`: runs Chromium on the GPU.

## Final result
- **Full page refresh removed:** YES. There was no document reload to begin with; the refresh-like hero rebuild is gone.
- **Internal navigation now client-side:** YES.
- **Tabs respond immediately:** YES.
- **Unnecessary network requests removed:** YES.
- **Production build passes:** YES.
- **Site is lighter than before:** YES.
