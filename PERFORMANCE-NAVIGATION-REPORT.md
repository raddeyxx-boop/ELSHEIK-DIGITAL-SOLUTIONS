# ELSHEIK DIGITAL SOLUTIONS — PERFORMANCE REPORT

Production performance pass, October 5, 2026. Current 1500 ms service hover timing and 180 ms closing grace are preserved. No commits, deployment, framework upgrades, dependency additions, production writes, schema/RLS changes, or environment-file changes.

## Conditions and baseline

Next.js 16.3.4 App Router, React 19, existing npm lockfile. Baseline used the previously verified production build; final measurements use a fresh build containing this pass. Chromium on this Windows machine, GPU/D3D11 launch flags, localhost, no CPU/network throttling. Navigation journeys cover English/Arabic at 1440, 768, 390 and 430 px; initial-route checks use fresh browser contexts at 1440 and 390 px with 844 px height. Public reads use the existing read-only CMS fixture. Each locale/width/route has one observation; medians across different locales/widths are descriptive, not repeat-run statistical confidence.

Navigation timing includes Playwright click actionability and content assertions, with 500 ms allowed for normal viewport prefetch. The initial JavaScript observation window ends 1000 ms after load and includes observed route-prefetch downloads. Decoded bytes are browser resource timings; wire bytes include HTTP overhead. These are local diagnostics, not deployed/mobile field Core Web Vitals.

Baseline ordinary route transitions were 83–190 ms, and first showcase transitions 202–386 ms. Local dashboard actions made zero requests. Some automated first-tab actions took about 1.1 seconds. These readings include scrolling/actionability and do not establish a one-second React update. The final tests separately measure click-to-paint.

## Fixes implemented

1. Deferred the six service scene modules until preview intent. Pointer entry warms the module during the existing 1.5-second dwell; pointer down warms it for tapping. Framework module caching avoids duplicate downloads. A panel-local loading boundary prevents lazy suspension from replacing the route. All service copy, SSR headings, layout and interaction timers remain intact.
2. Started project results, technologies and approved testimonials concurrently with the optional case-study lookup. Journey and architecture reads still wait for the case-study ID. Replaced four wildcard selections with the exact columns consumed by the public page, preserving publication, verification and approval filters.
3. Fixed an existing touch layout defect: emulated hover changed service-row padding and moved the preview button between pointer events and the synthesized click, particularly under reduced motion. Touch hover now keeps the resting geometry; desktop hover padding and all colors/design remain unchanged.

## Navigation

Client-side routing: PASS. No accidental full reloads found or removed. Same-locale journeys retain a document marker and the exact shared header node. Locale switches render the corresponding direction and content. Existing Next Link viewport prefetch remains enabled for major routes; no aggressive whole-site preloading was added. The Relax Moon showcase already has its own prerendered route and revalidation. No Dock exists in this project; the header is its global navigation.

| Transition | Baseline median ms | Final median ms |
| --- | ---: | ---: |
| Home → /services | 122.5 | 129.5 |
| /services → /technologies | 131.5 | 135.5 |
| /technologies → /work | 116.0 | 118.5 |
| /work → /work/relax-moon-spa-automation | 331.0 | 289.5 |
| /work/relax-moon-spa-automation → /work | 120.5 | 115.0 |
| /work → /insights | 107.0 | 115.5 |
| /insights → /about | 110.5 | 113.0 |
| /about → /contact | 114.5 | 116.5 |
| /contact → Home | 155.5 | 176.5 |

Differences in route timings are observations, not proof that every route became faster. Some routes fluctuate or regress slightly within local measurement noise.

## Tabs

Local dashboard switching: PASS. No network requests or document navigation during the five tab changes. The operations-console DOM node remains mounted, and the full operations workflow verifies shared mutations survive tab changes. Inactive views remain unmounted by the existing design; existing per-view filter reset behavior was preserved. No speculative memoization was added.

| Transition | Final median click-to-paint ms |
| --- | ---: | ---: |
| Overview → Bookings | 36.1 |
| Bookings → Team | 24.0 |
| Team → Customers | 23.2 |
| Customers → Activity | 25.9 |
| Activity → Analytics | 20.5 |

Click-to-paint uses two animation frames after the captured native click. It excludes Playwright scrolling/actionability and is not field INP.

## Data

One unnecessary query scheduling phase removed. With a read-only fixture adding 150 ms per CMS read, the dynamic diagnostic case study returned 200 with the same title in all four runs: warm median 481.9 → 326.0 ms (32.4% lower), excluding the first cold-server response. The fixture has no optional case-study record: this specifically demonstrates the saved phase in that path. A real record still needs its dependent architecture/journey reads, so this is not a 32% claim for every live case study or the prerendered showcase.

No duplicate query defect required a change: metadata/page detail reads already share React request-scoped cache. Public route prerendering, 60-second revalidation, admin invalidation, outage behavior and concurrent homepage reads were retained. No new global cache was introduced. Private/admin/user data caching and auth remain untouched. Public security filters: PASS in unit checks; schema/RLS were not modified or re-audited live.

## JavaScript and initial loading

| Route | Width | Load ms before → after | LCP ms before → after | Decoded JS kB before → after | Wire JS kB before → after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 1440 | 207 → 171 | 376 → 158 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /about | 1440 | 148 → 146 | 120 → 118 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /services | 1440 | 211 → 150 | 282 → 264 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /technologies | 1440 | 161 → 154 | 300 → 458 | 789.3 → 781.3 | 258.1 → 256.8 |
| /work | 1440 | 169 → 167 | 258 → 138 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /insights | 1440 | 163 → 160 | 142 → 140 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /contact | 1440 | 162 → 154 | 130 → 128 | 1337.1 → 1329.1 | 395.0 → 393.8 |
| /work/relax-moon-spa-automation | 1440 | 246 → 221 | 210 → 368 | 1402.0 → 1394.0 | 416.6 → 415.4 |
| Home | 390 | 195 → 175 | 190 → 166 | 1270.0 → 1248.5 | 371.2 → 364.8 |
| /about | 390 | 151 → 167 | 110 → 142 | 1230.1 → 1208.6 | 356.1 → 349.7 |
| /services | 390 | 147 → 150 | 108 → 112 | 1228.0 → 1219.7 | 355.5 → 353.7 |
| /technologies | 390 | 158 → 165 | 110 → 122 | 669.1 → 647.6 | 214.1 → 207.7 |
| /work | 390 | 145 → 138 | 142 → 116 | 1230.1 → 1208.6 | 356.1 → 349.7 |
| /insights | 390 | 142 → 151 | 106 → 122 | 1246.5 → 1225.4 | 361.4 → 355.6 |
| /contact | 390 | 148 → 157 | 106 → 126 | 1256.9 → 1235.4 | 366.1 → 359.7 |
| /work/relax-moon-spa-automation | 390 | 234 → 186 | 194 → 352 | 1281.8 → 1260.4 | 372.6 → 366.2 |

Home at 1440px: 8.0 kB less decoded JS (0.6%). These are modest incremental savings; the graphics engine remains the largest payload.

Home at 390px: 21.5 kB less decoded JS (1.7%). These are modest incremental savings; the graphics engine remains the largest payload.

Recognizable major baseline contributors: Three.js renderer chunks 368.6 + 185.7 kB; React DOM/runtime 234.2 kB; Next client/router runtime 155.4 kB; shared Motion/service chunk 158.3 kB. Optional Zod validation chunk is 100.9 kB and remains deferred until form validation. These are uncompressed built chunk sizes, identified by dependency code; not all chunks download on every route. No dependency was confirmed unused or removed. Named icon imports remain tree-shakeable. The operations demo remains isolated to the case-study route.

## Animation, media and Core Web Vitals

PixelBlast: existing optimized behavior preserved and browser-tested (GPU context reuse, offscreen/hidden pause, capped DPR, fallback and reduced motion). No additional graphics changes this pass. Services: only the active scene mounts; code now defers until intent, and all six bilingual scenes are tested. Technologies: existing CSS transform drift, local SVG icons, hidden/offscreen pause, Backend/Security sections and reduced-motion behavior preserved and tested. Fonts already use local Arabic subsets at weights 400/700, preloaded only for Arabic; Latin uses the existing system stack. CMS covers already use responsive Next images. Captured English desktop and Arabic mobile Services layouts were visually inspected. No analytics or external tracking/widget scripts were found.

Final initial-route local LCP range: 108–520 ms. CLS: 0.000 maximum in the observation window. INP: not measured; local click-to-paint is reported separately. These samples do not establish representative network/device or field targets.

Long tasks are collected per route in `.artifacts/performance/navigation-summary.json`. Hardware graphics, framework runtime and optional demos remain the large costs; their functionality and visual quality were preserved. Loading boundaries use the existing themed route UI; the optional scene boundary prevents page replacement without masking server latency.

## Tests

- Latest production Playwright outcomes: 142 distinct checks passed; 0 remaining failures. The main run passed 114 and failed 28 technology content assertions expecting live CMS groups. Explicit fixture metadata now selects the exact seven dictionary groups while preserving the original live eight-group expectations. The affected technology suite rerun passed all 29 checks (one duplicates the earlier successful drift test), against the same final build. Raw reports preserve both runs.
- Vitest: 49 passed across 18 files.
- Lint: PASS. Typecheck: PASS. Fresh production build: PASS (38 generated pages; public/admin/API route classifications preserved).
- Browser suites: service-hover, optimization, performance-navigation, header-navigation, technologies, case-study-demo, process, operations-demo and pixel-background. Contact success uses a mocked inquiry response; no remote mutation is submitted.
- Desktop/tablet/mobile, English/Arabic/RTL, keyboard, reduced motion, all six preview scenes, language switching, contact validation, technology drift, graphics lifecycle, conversational booking and operations mutations are covered.

## Files modified

- `src/components/services/service-list.tsx`: optional scene loading, intent warming and panel-local suspension boundary.
- `src/components/sections/page.module.css`: stabilize touch hover geometry.
- `src/server/queries/public-content.ts`: concurrent independent reads and narrower columns.
- `tests/integration/service-hover.test.tsx`: isolate existing interaction timer assertions from optional module loading.
- `tests/e2e/service-hover.spec.ts`: all six bilingual previews on desktop/touch with reduced motion.
- `tests/e2e/optimization.spec.ts`: assert no service scene JavaScript before preview intent.
- `tests/e2e/technologies.spec.ts`: use explicit production-fixture metadata to distinguish dictionary groups from live CMS groups; retain exact labels, icon, containment and motion assertions.
- `playwright.optimization.config.ts`: add focused navigation, technology and booking suites to safe production tooling.

## Files created

- `tests/e2e/performance-navigation.spec.ts`: initial resources/vitals, measured route journeys, persistence, overflow, console checks and local tab click-to-paint/request checks.
- `tests/unit/public-case-study-queries.test.ts`: verifies independent reads start before the lookup finishes, output mapping and publication/approval filters.
- `PERFORMANCE-NAVIGATION-REPORT.md`: this report.
- `.artifacts/performance/navigation-baseline.json`, `initial-baseline.json`, `navigation-final.json`, `navigation-summary.json`, `technology-final.json`, `cms-baseline.json`, `cms-final.json`: raw evidence.
- `.artifacts/performance/measure-cms-waterfall.mjs`, `summarize-navigation.py`, `write-navigation-report.py` and preview diagnostic scripts: reproducible local read-only diagnostics.
- `.artifacts/performance/navigation-layouts/`: saved preview screenshots. Originals for this pass are in `navigation-pass-originals/`; earlier performance/hover work was preserved.

## Remaining limits

No physical mobile device, deployed-network throttled benchmark, field INP, authenticated admin flows, actual backend mutation/webhook/workflow, or live CMS image bandwidth test was performed. The fixture uses sanitized/empty CMS data, so this is not a complete live-content/security audit. GPU-capable visitors still download the large graphics engine; first keyboard/touch preview use loads a small optional scene chunk. Observed byte savings are modest. Browser/script execution, graphics and normal route prefetch remain the main browser payload.

Historical service-preview/recovery suites with pre-change hover expectations and live-CMS-only fallback anchors were not used as evidence for this pass; the updated service-hover suite verifies the current timing and all six scenes. Existing historical reports remain unchanged. Temporary diagnostic/test servers were stopped; no commit, push or deployment was made.
