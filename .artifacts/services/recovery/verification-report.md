# Services preview verification — 2026-09-06

The interrupted implementation was preserved and completed. The existing CMS data, service order, anchors, resting list design and backend behavior were retained.

## Evidence

- Safe Playwright coverage: **47 distinct tests passed, 0 failed**. The initial complete safe run passed 45/46; its single 1024px scene-containment failure was corrected. The final service rerun passed all 22 tests, and the additional mobile-width keyboard-navigation test passed separately. The 24 unaffected frontend tests retain their successful full-suite results.
- **5 tests excluded**, not counted as passes: 3 in `tests/e2e/live-backend.spec.ts`, 2 in `tests/e2e/phase4b-admin.spec.ts`. SKIPPED — backend-writing integration test; outside UI-only scope.
- `npm test`: **20 passed / 0 failed / 0 skipped** (10 test files).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0; 3 existing unused-symbol warnings in `homepage.tsx` (Arrow, fieldThemes, startSignals).
- `npm run build`: exit 0; compiled, typechecked and generated all 36 static pages.
- **96 distinct screenshot states manually inspected**, using the original images, review sheets and full-size representative images. This includes all required 84 states plus 12 additional 375px states.
- Geometry matrix: **0 horizontal page-overflow failures**. Final responsive tests also check scene containment, preview dimensions, resting geometry, and overlap with service copy/actions.
- All 43 backend/admin/Supabase files hashed at recovery start remain byte-for-byte unchanged.

## Verified behavior

Six distinct scenes: website, operations dashboard, mobile operations app, automation workflow, decision interface, and connected platform. Desktop scenes measure approximately 396–580px wide; mobile/tablet scenes use the available width up to 580px. The phone frame is 208 × 360px before its restrained rotation.

Each scene completes its 3.4-second sequence and holds. Only the selected scene runs; leaving/unmounting clears timers. Reduced motion immediately renders the completed state. English and Arabic have localized labels, intentional RTL composition, and readable Latin technology names.

Intentional switching through 01 → 02 → 03 → 04 → 05 → 06 → 01 passes independently of the stationary-pointer regression. In the regression test, Escape collapses the focused row while the cursor stays fixed; another row is confirmed beneath that cursor without activating. A subsequent explicit pointer move activates it.

Touch opens, switches and closes all six services at 390px and 430px in both languages. Preview activation does not navigate; arrows/CTAs retain navigation. Keyboard focus reveals previews, Space restores a dismissed preview, and Enter retains native link navigation, including at mobile widths.

## Completion changes

- `src/components/sections/homepage.tsx`: restored missing ArrowUpRight and MoveRight imports only.
- `src/components/services/service-list.tsx`: pointer-intent validation, touch/focus coordination, keyboard navigation preservation and active-row preview placement.
- `src/components/services/service-list.module.css`: sufficient shared preview height and tablet placement without changing resting geometry.
- `src/components/services/service-preview.tsx`: preserved the six scenes, removed the redundant phone overlay, corrected the preview brand label to ELSHEIK, and shortened module status copy through localization.
- `src/components/services/service-preview.module.css`: repaired narrow platform containment and removed obsolete phone-overlay styling.
- `src/components/services/scene-content.ts`: localized short synchronized status.
- `tests/e2e/services-preview.spec.ts`: meaningful size/containment checks, intentional pointer movement, touch/navigation and 768px coverage.
- `tests/e2e/services-recovery.spec.ts`: independent stationary-pointer, completion/hold, complete touch-switching and keyboard regressions.

## Artifacts

- [Screenshot gallery](../index.html)
- `../cinematic-{en|ar}-{width}-{web|apps|mobile|automation|ai|software}.png`
- `../review-sheet-{width}.png`
- `../cinematic-geometry.json`
- `playwright.log`: original complete safe run and the now-resolved clipping failure.
- `playwright-services-final.log`: 22/22 final service tests.
- `keyboard-final.log`: additional mobile-width keyboard test.
- `lint-final.log`, `typecheck-final.log`, `build-final.log`.
- `before-hashes.json`, `backend-before-hashes.json`, `homepage-before-hash.json`.

## Remaining limits

- Browser verification uses Chromium and emulated touch/viewports; other engines and physical devices were not tested.
- The working tree was already untracked, so a trustworthy tracked baseline diff is unavailable. Recovery hashes and the scoped changes above document this pass.
- Three existing homepage lint warnings remain. Backend-writing tests were intentionally excluded.
