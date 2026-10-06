Performance work completed in the existing project on October 4, 2026. No framework upgrades, commits, pushes, deployments, or changes to `.env` were made. This folder has no Git repository; original copies of changed source files are in `.artifacts/performance/originals/` with `.original` extensions.

The main avoidable costs were downloading the Three.js hero renderer before discovering that WebGL was unavailable or software-only, shipping architecture validation to browsers and parsing it on each diagram render, eagerly shipping contact validation through navigation prefetch, and allowing the homepage module timer/compositor animation to continue in hidden tabs. CMS article covers also used full-size storage images without responsive variants.

Navigation already used Next links, public reads already used appropriate prerendering/revalidation, independent homepage requests already ran concurrently, and detail/metadata queries already used request-scoped deduplication. Fonts are already self-hosted Arabic subsets with two small weights; local media consists of small SVG icons. These did not justify further changes. Private/admin caching, authentication, server-side form validation, mutations and invalidation were preserved. No dependency was confirmed safe to remove after checking static and dynamic usage, including optional postprocessing.

Files changed and purpose:

| File | Change |
| --- | --- |
| `src/components/backgrounds/hero-pixel-background.tsx` | Check GPU capability during idle time before loading the optional renderer; preserve the existing static fallback. |
| `src/components/backgrounds/pixel-blast/webgl-context.ts` | Share the capability-check context with the renderer; reject software rendering under the existing policy; release unclaimed contexts. |
| `src/components/backgrounds/pixel-blast/pixel-blast.tsx` | Consume that shared context instead of checking capability after downloading Three.js. |
| `src/components/architecture/architecture-diagram.tsx` | Validate diagram data at the server component boundary. |
| `src/components/architecture/architecture-diagram-client.tsx` | Preserve the interactive diagram while importing only schema types in the browser. |
| `src/components/forms/contact-form.tsx` | Load the unchanged schema/resolver on the first validation attempt; retain form markup, transformations, validation and submission behavior. |
| `src/components/motion/system-field.tsx` | Pause the packet animation and module interval when the tab is hidden; remove the visibility listener on teardown. |
| `src/components/live/use-live-flow.ts` | Disconnect the shared observer when its final subscriber unmounts. |
| `src/components/insights/journal.tsx` | Use responsive Next images for public CMS covers with reserved layout space and eager/high-priority loading for the primary cover. |
| `next.config.ts` | Allow image optimization only for the configured public CMS media path. |
| `src/components/sections/homepage.tsx` | Remove two confirmed unreferenced local content arrays; all rendered content stays intact. |
| `scripts/measure-performance.mjs` | Reproducible production diagnostics with fresh browser contexts and an optional GPU mode. |
| `playwright.optimization.config.ts` | Production browser regression configuration using the existing read-only fixture on separate ports. |
| `tests/fixtures/operations-server.mjs`, `tests/fixtures/production-cms-fetch.mjs` | Allow isolated fixture ports; retain the default behavior and read-only credential-stripping policy. |
| `tests/e2e/services-preview.spec.ts`, `tests/e2e/services-recovery.spec.ts` | Use the configured test base URL instead of hardcoded development ports. |
| `tests/e2e/optimization.spec.ts` | Check graphics-download avoidance, retained document navigation, contact validation/mocked submission and the login shell. |
| `tests/unit/pixel-context.test.ts`, `tests/integration/system-field.test.tsx` | Cover context reuse/release, software/unavailable fallback, and hidden-tab pausing. |

An on-demand service-preview / smaller Motion feature experiment was reverted after inconsistent interaction/layout checks. Service list, service preview and connected workflow source files are byte-identical to their originals. No animations or features were removed.

Measured downloads, in decimal kB:

| Viewport / route | Baseline JS | Final fallback JS | Baseline gzip estimate | Final fallback gzip estimate |
| --- | ---: | ---: | ---: | ---: |
| 1440px / home | 1418.3 | 782.0 | 407.5 | 248.1 |
| 1440px / services | 1418.3 | 782.0 | 407.5 | 248.1 |
| 1440px / process | 1418.3 | 782.0 | 407.5 | 248.1 |
| 390px / home | 1370.0 | 714.8 | 391.3 | 225.2 |
| 390px / services | 1225.2 | 672.9 | 348.2 | 210.1 |
| 390px / process | 1240.6 | 688.2 | 352.5 | 214.4 |

Fallback visitors request approximately 45–48% less uncompressed JavaScript, with gzip estimates down 39–42%. GPU-enabled final desktop downloads are 1336.6 kB (387.1 kB estimated gzip): about 6% less raw JS than the baseline downloads, while keeping the animated hero. GPU-enabled final 390px home downloads are 1269.4 kB; services/process downloads are 1227.5/1242.8 kB, slightly above their baseline by approximately 2.3 kB. The large fallback saving does not apply to GPU-capable visitors.

Conditions: `npm run build` and `npm run start -- --port 3120`, Chromium on this Windows machine, localhost, no network/CPU throttling, fresh browser contexts, three runs per route and width, 900px viewport height, unchanged navigation prefetch enabled. JavaScript totals include observed route-prefetch downloads. Gzip numbers are offline per-file estimates, not actual wire transfer measurements. Baseline used default headless Chromium/software fallback. Final GPU runs used the project's GPU launch flags; their download totals are reported separately, and their paint times are not a controlled before/after GPU comparison.

Median local LCP, milliseconds:

| Viewport / route | Baseline fallback | Final fallback | Final GPU |
| --- | ---: | ---: | ---: |
| 1440px / home | 176 | 184 | 184 |
| 1440px / services | 132 | 140 | 124 |
| 1440px / process | 248 | 224 | 428 |
| 390px / home | 148 | 156 | 156 |
| 390px / services | 108 | 116 | 104 |
| 390px / process | 184 | 196 | 192 |

All measured CLS values were zero and all measured runs had zero page exceptions. There is no consistent demonstrated LCP improvement. Local readings do not establish field Core Web Vitals, mobile-device performance, or INP. Raw observations are in `.artifacts/performance/before.json`, `after-final.json` and `after-gpu.json`; `after.json` records an earlier experiment and is not the final result.

Verification:

- Final `npm run build`: passed, preserving the same public/admin/API route structure and static/dynamic classifications.
- `npm run typecheck`: passed.
- Final `npm run lint`: passed with zero errors and zero warnings.
- `npm test`: all 42 tests across 16 files passed, including new context lifecycle and hidden-tab tests, existing form validation and architecture schema tests.
- Final focused production browser command: `npx playwright test --config playwright.optimization.config.ts optimization.spec.ts pixel-background.spec.ts services-preview.spec.ts services-recovery.spec.ts`. Result: 29 passed, 8 failed. All 14 graphics/navigation/form/login-shell checks passed. Successful service checks included bilingual homepage layouts across nine widths, keyboard activation, stationary-pointer behavior, complete sequences and touch switching across all six services.
- The eight remaining service-suite failures run against byte-identical original service code: five expect the live CMS anchor `#mobile-applications`, while the empty-services fixture correctly exercises the existing dictionary fallback `#mobile`; two expect the expanded detail row to be at least 80px taller than its resting row (observed approximately 630/633px versus required 646px); one samples an Arabic animation's X coordinate after exactly 150ms and observes the same coordinate. These assertions were not weakened and the original design was not changed to satisfy them. Traces/error snapshots are in `test-results/`.
- An earlier broader production run passed 120 of 136 checks, including header layouts at 320–1920px, bilingual public navigation/language switching, diagram click-latency budgets below 100ms, repeated route navigation below 1s, process/reduced-motion interactions, and complete operations workflows and responsive layouts. Its failures included the subsequently reverted preview experiment and two Insights empty-state assertions: those pages rendered their CMS-unavailable state instead. The complete broad suite was not rerun after the final changes; the final focused run and unit/build checks cover the final implementation.
- Generated mobile service-preview, mobile workflow and desktop Arabic operations screenshots were visually inspected. The in-app browser was unavailable, so verification used the project's Playwright tooling.

Remaining limits: no real mobile-device/network or field-INP measurements, no authenticated admin mutation/login session, no live contact persistence/webhook submissions, and no end-to-end image-delivery verification against a published CMS cover. Contact success was tested with a mocked API response, avoiding remote writes. Responsive cover configuration and layout were checked in source/build; image bandwidth savings were not measured. Existing CMS-unavailable behavior was retained. The read-only browser fixture supplies empty CMS tables and cannot represent all live content or integrations.

The temporary measurement/test servers were stopped. Pre-existing development/production servers on other ports were left intact.
