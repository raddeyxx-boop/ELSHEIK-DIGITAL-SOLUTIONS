# Hero empty-space rebalance — final verification

The existing hero has been rebalanced without replacing its headline, typeface, buttons, header, or system-diagram concept. Only four implementation files changed. The final continuation required no further implementation edits.

## Implementation

- `src/components/sections/homepage.module.css`: hero-only shell capped at 1640px with 6–7.3% large-desktop gutters; 44/56 column ratio and 24–40px gap; viewport-height-aware headline scale; compact capability row; stacked layout at 1100px and below.
- `src/components/sections/homepage.tsx`: spans retain the requested six English headline lines on desktop, allowing natural wrapping on smaller screens.
- `src/components/motion/system-field.module.css`: diagram capped at 850px; proportional core, modules, icons and text; visible supporting module labels on mobile; intentional RTL module text and LTR technical flow.
- `src/components/motion/system-field.tsx`: localized Arabic module labels; SVG signal shares the connections' coordinate system; original 1.7-second active-module cycle and 4.6-second signal loop retained; reduced-motion preference subscription supports initial rendering and live changes without hydration errors.

## Measured English dimensions

| Viewport | Before | After |
|---|---|---|
| 1920×1080 hero content width | 1408px | 1640px |
| 1920×1080 diagram | 784×560px | 850×661px |
| 1920×1080 core diameter | 190px | approximately 246px |
| 1920×1080 hero height, excluding header | 1155px | 1006px |
| 1366×768 hero height, excluding header | 893px | 757px |
| 1366×768 CTA bottom | — | 734px within the 768px viewport |

On short desktops the capability footer may continue below the first viewport; the headline, supporting copy, both CTAs, and diagram remain visible. Tablet/mobile deliberately stack and scroll to the diagram.

## Verification

- `geometry-check.mjs`: 20/20 viewport/language states passed. No horizontal overflow, all modules inside the diagram, no module/core overlap, CTAs within initial viewport, correct stacking.
- `verify.mjs`: English and Arabic interaction scenarios passed against development and production. Semantic heading, CTA destinations, keyboard focus outlines, module hover/focus, moving SVG signal, active-module cycle, live reduced-motion changes. Zero browser page errors.
- `production-check.mjs`: 6/6 production viewport checks passed at 1920×1080, 1366×768, and 390×844 in both languages. Layout dimensions match captured final geometry. Reduced-motion initial load has no moving signal or hydration errors.
- Playwright `tests/e2e/public.spec.ts`, filtered to `English and Arabic public routes work`: 1 passed, 0 failed, 0 skipped.
- Vitest `npm test`: 20 passed across 10 test files, 0 failed, 0 skipped; exit 0.
- Lint: exit 0; same 3 preexisting homepage unused-symbol warnings (`Arrow`, `fieldThemes`, `startSignals`), no errors.
- Typecheck: exit 0.
- Production build: exit 0, fully completed after final source changes.

Five backend-writing Playwright tests were excluded: three in `live-backend.spec.ts`, two in `phase4b-admin.spec.ts`. They are not passes or frontend failures. No backend-writing integration suite was executed.

## Visual evidence

All ten requested sizes were visually inspected in English and Arabic: 1920×1080, 1728×1117, 1536×864, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 390×844, 375×812.

Artifacts: 40 before PNGs, 40 after PNGs (viewport and full hero for each state), 6 production screenshots, and 10 paired review sheets. All 20 final full-hero states and the six production screenshots were manually inspected. The final motion lifecycle change did not change geometry, as confirmed by production checks.

Open `index.html` for the before/after gallery. Before element screenshots retain the original sticky-header overlay caused by element capture; after hero captures use full-page cropping to avoid it. Development indicators are hidden only in capture styling, not in application source.

## Integrity and limits

All 43 backend files match the existing recovery hashes. Comparing the task's complete `src`/`supabase` snapshot found only the four hero implementation files changed; services preview and unrelated features remain untouched.

Verification used Chromium with desktop/mobile viewport emulation, not physical devices or other browser engines. Accessibility checks cover the hero's semantics, keyboard/focus behavior, visible text, and reduced motion; this is not a full assistive-technology audit. The preexisting untracked working tree prevents a reliable Git baseline diff, so file hashes were used.

Final decision: READY within the verified UI-only scope.
