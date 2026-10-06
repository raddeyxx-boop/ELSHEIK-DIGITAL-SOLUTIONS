# Process 2.0 · Navigation Consolidation · Compact Stage Navigator — Report

Date: 2026-09-25. All measurements are local, from the production build.

Evidence is in `.artifacts/process/`:
- `before/`, `after/`: screenshots
- `playwright.log`, `vitest.log`, `lint.log`, `build-*.log`
- `.artifacts/content/metrics-nodock.json`: route metrics

## Navigation consolidation

| Item | Result |
|---|---|
| Dock removed | **YES**: both the desktop QuickDock and the mobile bottom Dock |
| Dock code fully cleaned | **YES**: `Dock.tsx`, `quick-dock.tsx`, `mobile-dock.tsx`, `Dock.SOURCE.md`, `Dock.LICENSE.md` deleted; imports, `data-dock-avoid` and the `nav.quick` dictionary key removed |
| Dock-only CSS removed | **YES**: `Dock.css` deleted, including the 96 px mobile `body` padding and scroll-padding it reserved |
| Process added to header | **YES**: Home · Services · Work · **Process** · About · Insights · Contact |
| Arabic Process navigation | **YES**: «كيف نعمل» (existing dictionary label), route unchanged (`/ar/process`) |
| Dock actions preserved through the header | **YES**: both Docks' destinations are all in the header now |
| Active route state | **YES**: the existing refined state (full-strength text plus a 1 px lime underline on desktop, lime on mobile), exactly one `aria-current="page"` |
| Desktop navigation tested | **YES**: 7 routes × 2 locales, active state, language switch, CTA |
| Mobile navigation tested | **YES**: the menu holds 7 destinations, the language switch and the CTA; Process is active |
| Arabic navigation tested | **YES**: RTL order, Tajawal, one row, active state |
| English navigation tested | **YES** |
| Dependency removed | **None.** `motion` is still used by six other components (featured case study, connected workflow, hero system, system experiences, service list, service preview). |

**Why the mobile Dock also went.** It came from an earlier task, but it was also a floating bottom navigation duplicating the header. The instruction was no bottom Dock and a single global navigation, and the header menu already covered all its destinations.

**Header changes (no redesign)**
- Added the Process link.
- Removed the decorative house icon next to Home, so navigation is text-only.
- The compact menu now takes over below **1024 px** instead of 900 px: seven links in Arabic metrics crowded to 16 px spacing at 901 px.
- Gaps are fluid (`clamp()`) at 1024–1440 px, and the 260 px logo column is now `minmax(max-content, 260px)`.
- Result: one row at every width from 1024 to 1920 px, with at least 24 px between brand, navigation and actions.
- The header remains the existing small client component (it needed the pathname already); no new client boundary.

## Process: stage navigator (compact and responsive)
- The eight-stage model and every interaction are kept: tabs pattern, arrow keys, Home/End, "next stage", and the 08 → 01 loop.
- The fixed minimum heights (9–12.5 rem) are gone; nodes size to their content.
- The number, stage dot and timeline rule now share one head row. The rule runs on into the next node, so the row still reads as a single timeline.
- Selected stage: lime top rule, lime number and dot, 800-weight title, faint tint.

| Width | Layout | Tablist height (before → after) |
|---|---|---|
| 1920 | 8 in one row | 201 → 152–159 px |
| 1440 | 8 in one row | 201 → 140–146 px |
| 1280 | 8 in one row | 201 → 145–157 px |
| 1024 | 4 × 2 (was 8 cramped 144 px columns) | 237–248 px, with descriptions |
| 768 | 2 × 4 (was 4 columns without descriptions) | 413–417 px, with descriptions |
| 430 / 360 | Compact 2 columns (number and title) | 284–293 px |

On phones, the short description moves into the selected stage's panel (`.panelShort`), so no information is lost.

## Process content (already built by the parallel session; verified here)
- `src/content/process.ts` holds a typed model per stage: objective, inputs, activities, automation, decision gate, outputs, quality, next.
- Sections:
  - automation by design (automation at every stage)
  - the execution model: event → context → decision → action → verify → record → notify, with a failure path to retry or escalate
  - delivery artifacts ("depending on scope")
  - the responsibility matrix
  - gates and quality signals
  - the human/automation boundary
  - failure-first engineering
  - security principles
  - the evolution loop
  - the CTA
- The page body is server-rendered. Only `StageNavigator` hydrates, and its panels are passed in as server children.
- **Accuracy:** no metrics, durations, SLAs or certifications. The file header states it's methodology only.
- **Arabic:** all interface copy is localized («المرحلة المحددة»). Remaining Latin text is intentional technical codes (`STAGE 05 / AUTOMATION`, `VERIFY`, `RETRY`, `SYSTEM GATES`, `OBJ`, `IN`, `ACT`, …). Tajawal throughout; RTL verified.
- **English:** full parity (same model and sections).

## Responsiveness
- The header spec covers 1920, 1440, 1366, 1280, 1180, 1100, 1024, 1023, 901, 768, 430, 390, 375, 360 and 320 px, in both locales.
- Process covers 1920, 1440, 1280, 1024, 768, 430 and 360 px, plus the existing process spec's widths.
- No horizontal overflow anywhere.

## Performance (production build)

Transferred JS, compared with the previous build that still had both Docks:

| Route | Before | After | Change |
|---|---|---|---|
| Home 1440 | 398,834 B | 396,232 B | −2.6 KB |
| Home 390 | 394,576 B | 391,952 B | −2.6 KB |
| Case study 1440 | 402,326 B | 396,629 B | −5.7 KB |
| Case study 390 | 398,068 B | 377,403 B | −20.7 KB |
| Contact | 378,882 B | 327,538 B | −51.3 KB (the Dock was Contact's only `motion` user) |
| Process 1440 / 390 | — | 327,538 / 285,015 B | — |

- **CLS:** 0 on all 18 routes × 2 widths. No page errors.
- **Process LCP:** 160–188 ms.
- **Long tasks, hardware GPU:** 1–2 at load (79–108 ms), and **none during eight stage switches**. Default headless SwiftShader shows 80–160 ms WebGL tasks; that's the known software-renderer artifact.

## Tests

| Check | Result |
|---|---|
| Browser, production (`playwright.performance.config.ts`) | **89 / 89** |
| Unit + integration | **36 / 36** |
| Lint | PASS: 0 errors, the same 3 existing warnings in `homepage.tsx` |
| Typecheck | PASS |
| Build | PASS |

The 89 browser tests are the 40 previous ones, plus 34 in the new `header-navigation.spec.ts`, plus 15 in `process.spec.ts`, which was added to the production suite (its quick-dock test was removed).

**Dock-only test removed:** `tests/e2e/dock.spec.ts`. Its header layout checks live on in `header-navigation.spec.ts`, which also asserts that no Dock or floating nav exists.

## Files changed
- `src/app/[locale]/layout.tsx`: removed the QuickDock render and import.
- `src/components/layout/header.tsx`: added Process; removed the MobileDock and the house icons.
- `src/components/layout/header.module.css`: 1024 px menu breakpoint, fluid gaps, flexible logo column.
- Deleted: `src/components/Dock.tsx`, `Dock.css`, `Dock.SOURCE.md`, `Dock.LICENSE.md`, `src/components/layout/quick-dock.tsx`, `mobile-dock.tsx`, `tests/e2e/dock.spec.ts`.
- `src/content/dictionaries/en.ts`, `ar.ts`, `types.ts`: removed the dead `nav.quick`.
- `src/components/process/stage-navigator.tsx`: head row (number and dot).
- `src/components/process/process.module.css`: compact fluid nodes, the 2 / 4 / 8 column breakpoints, `.panelShort`.
- `src/components/process/process-page.tsx`: phone summary in the panel; removed `data-dock-avoid`.
- `tests/e2e/header-navigation.spec.ts` (new): routes, active states, language, CTA, layout, mobile menu, no Dock.
- `tests/e2e/process.spec.ts`: removed the quick-dock test and the unused helper.
- `tests/e2e/technologies.spec.ts`: header expectations updated (7 links, 1024 px breakpoint, menu toggle instead of Dock).
- `tests/e2e/operations-demo.spec.ts`: removed a dead Dock selector from the screenshot style.
- `playwright.performance.config.ts`: added `header-navigation` and `process`.

## Remaining issues

### Application
- `tests/e2e/technologies.spec.ts` was already stale, independent of this work. It expects eight technology groups ("Verification, Frontend, … Infrastructure"), while the page renders seven ("Interface, Backend, Data, Automation, Security, Quality, Infrastructure").
  - All 28 of its tests fail on that content assertion; its header assertions pass.
  - It's left out of the production suite pending a decision on the intended groups.
- `tests/e2e/visual-responsive.spec.ts` is stale too (see the previous report).

### External
- CMS DNS `ENOTFOUND` is unresolved; outage handling is unchanged and still covered by tests.
