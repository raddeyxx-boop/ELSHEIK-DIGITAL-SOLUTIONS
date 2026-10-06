# Header Home link and mobile Dock â€” final verification

Closure date: 2026-09-13. Current implementation was preserved. No reproducible application defect was found during this continuation; changes were confined to verification tests and QA artifacts.

## Implementation and breakpoints

The public desktop navigation contains Home, Services, Work, About, Insights and Contact. Home uses the existing Lucide House icon, hidden from assistive technology, with a real Next.js Link to `/en` or `/ar`. All navigation entries share the existing underline treatment for the active route. Language switching and the Start a project CTA remain available.

Full desktop navigation: **greater than 900 CSS pixels** (901px and above). Mobile menu toggle and Dock: **900 CSS pixels and below**. There is no overlap or missing navigation range. The existing compact header stays visible; language selection, Insights and the project CTA are available in the full mobile menu.

Dock items, in semantic reading order:

- English: Home, Services, Work, About, Contact.
- Arabic: Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©ØŒ Ø§Ù„Ø®Ø¯Ù…Ø§ØªØŒ Ø£Ø¹Ù…Ø§Ù„Ù†Ø§ØŒ Ù…Ù† Ù†Ø­Ù†ØŒ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.

Arabic uses native RTL flex reading order with the same semantic DOM sequence and viewport-relative proximity measurements. Icons and labels stay paired. Case-study pages mark Work active; Insights has no falsely active Dock item.

The panel is 68px high, base items 50px, magnification 58px. The tested 320px layout fits without removing magnification or changing application CSS. Reduced motion keeps the links and focus indicators functional at their base size.

Bottom placement is `10px + env(safe-area-inset-bottom, 0px)`. Public mobile body bottom padding is `96px + env(safe-area-inset-bottom, 0px)`; scroll padding is `110px + env(safe-area-inset-bottom, 0px)`. This reserves room for the Dock beneath footer links/legal content. The reserved space remains stable during temporary hiding to avoid a layout jump. Desktop gets no Dock padding.

## Verification

Focused tests cover both locales at 1920, 1440, 1366, 1101, 1024, 901, 900, 768, 600, 430, 390, 375, 360 and 320px. They check Home semantics and active state, header bounds, exclusive responsive visibility, mobile menu hide/restore, route navigation, RTL order, fixed position during scrolling, footer clearance, all visible Contact controls, reduced motion and magnification bounds. Header keyboard sequence and locale-switch active state were additionally recorded in `closure-extra-results.json`.

Contact controls checked: name, company, email, phone, country, budget, timeline, service select and description textarea. All hide the Dock while focused and restore it after blur. The existing phone field is an input of type `text`, not `tel`; its actual behavior was verified without changing the form. The submit button remains reachable. No form was submitted.

Home, Services, Work, About, Insights, Contact and the Relax Moon Spa case study were covered at 390Ã—844. Footer bounds clear the Dock on both locales. Existing Services and case-study interaction tests are included without modifying those features.

30 screenshots were opened and inspected across this feature's final verification: 12 original locale/viewport captures, four original focus/footer captures, eight Services/case-study/Contact/320px captures, and six closure captures showing the 901px boundary, focused Contact textarea and case-study footer in both languages. Repeated views were not counted twice.

The earlier failed run is retained in `playwright-final.log`. Its failures were test issues: an overly broad header selector (fixed during that run), an explicit submit-type selector against a default-submit HTML button, and the Next.js development indicator intercepting a hover. The final tests target only `body > header`, locate the actual form button, and suppress only the development indicator. Assertions for application bounds, navigation and accessibility were retained.

Final checks: lint PASS (0 errors, 3 preexisting warnings); typecheck PASS; Vitest 20 passed / 0 failed / 0 skipped; Playwright 45 passed / 0 failed / 0 skipped (31 Dock/header, 10 Services, 4 case-study); production build PASS.

## Files

Modified during the latest continuation: `tests/e2e/dock.spec.ts`; QA scripts, captures, logs and this report. No application implementation changes or dependency installation in this continuation.

Final implementation files:

- `src/components/layout/header.tsx`
- `src/components/layout/header.module.css`
- `src/components/layout/mobile-dock.tsx`
- `src/components/Dock.tsx` â€” component
- `src/components/Dock.css` â€” plain CSS
- `src/components/Dock.SOURCE.md` â€” official registry provenance and adaptations
- `src/components/Dock.LICENSE.md` â€” retained React Bits license

Source notes and license were completed in the preceding continuation and remain intact. `package-lock.json` was refreshed during the original CLI install and restoration; declared dependency versions were preserved. No additional icon library or new dependency remains. Motion is declared `^13.2.0`; the lockfile contains one `node_modules/motion` entry at **13.2.0**. Lucide remains `^1.40.0`.

The exact official JS-CSS registry component was installed with `npx shadcn@latest add @react-bits/Dock-JS-CSS --yes`. The installed JavaScript was adapted to TypeScript because this project disables allowJs. Proximity interpolation, Motion springs and magnifying items derive from that source; real links, reduced motion, persistent touch captions and ELSHEIK colors are integration adaptations. The original files and registry response are retained under this artifact directory.

## Backend preservation

Comparison with `.artifacts/dock/before-hashes.json` shows only the existing public header TSX and CSS files changed among preexisting `src` and `supabase` files. New Dock files are frontend-only. Backend, CMS, Supabase, auth, API routes, migrations and existing Services/case-study code remain unchanged. Git is entirely untracked, so the recovery hash snapshot provides the comparison rather than a Git diff.

Five backend-writing tests were deliberately excluded: three from `live-backend.spec.ts`, two from `phase4b-admin.spec.ts`. They mutate Supabase/admin/CMS state and are outside this UI-only task. They are exclusions, not Playwright runner skips.

## Artifacts and limits

- [EN 901px](en-901-closure.png), [AR 901px](ar-901-closure.png)
- [EN desktop](en-1440.png), [AR desktop](ar-1440.png)
- [EN mobile](en-390.png), [AR mobile](ar-390.png)
- [EN narrow magnification](en-320-final.png), [AR narrow magnification](ar-320-final.png)
- [EN focused form](en-contact-focused-closure.png), [AR focused form](ar-contact-focused-closure.png)
- [EN case-study footer](en-case-footer-closure.png), [AR case-study footer](ar-case-footer-closure.png)
- [Final Playwright](closure-playwright.log), [lint](closure-lint.log), [typecheck](closure-typecheck.log), [Vitest](closure-vitest.log), [build](closure-build.log)
- [Extra keyboard/locale checks](closure-extra-results.json), [source hash comparison](changed-files.json)
- `registry.json`, `Dock.registry.jsx`, `Dock.registry.css`, `install.log`, `header-bounds.mjs`, `closure-capture.mjs`

Browser verification uses Chromium and emulated viewport/focus behavior. A physical mobile keyboard and nonzero hardware safe-area inset were not tested. Three preexisting lint warnings remain in homepage.tsx (`Arrow`, `fieldThemes`, `startSignals`). Development logs contain occasional destination-stream-closed messages during rapid navigation; these did not fail the route checks. No deployment was performed.

## Acceptance matrix

| Check | Result |
|---|---|
| HEADER HOME LINK FEATURE | PASS |
| RECOVERY FROM INTERRUPTED STATE | PASS |
| DESKTOP HOME ITEM | PASS |
| HOME ICON | PASS |
| ENGLISH HOME ROUTE | PASS |
| ARABIC HOME ROUTE | PASS |
| HOME ACTIVE STATE | PASS |
| DESKTOP HEADER PRESERVED | PASS |
| 900PX BREAKPOINT | PASS |
| 901PX BREAKPOINT | PASS |
| 1024PX HEADER | PASS |
| MOBILE DOCK | PASS |
| DOCK FIVE ITEMS | PASS |
| DOCK ACTIVE STATE | PASS |
| DOCK MAGNIFICATION | PASS |
| 430PX | PASS |
| 390PX | PASS |
| 375PX | PASS |
| 360PX | PASS |
| 320PX | PASS |
| DOCK ARABIC | PASS |
| DOCK RTL | PASS |
| MOBILE MENU HIDES DOCK | PASS |
| CONTACT TEXT INPUT | PASS |
| CONTACT EMAIL INPUT | PASS |
| CONTACT TEL INPUT | PASS for existing phone field (type=text; no type=tel field exists) |
| CONTACT SELECT | PASS |
| CONTACT TEXTAREA | PASS |
| DOCK RETURNS AFTER BLUR | PASS |
| FOOTER ACCESS | PASS |
| CASE STUDY FOOTER ACCESS | PASS |
| SAFE AREA | PASS |
| KEYBOARD | PASS |
| ACCESSIBILITY | PASS |
| REDUCED MOTION | PASS |
| SERVICES REGRESSION | PASS |
| CASE STUDY REGRESSION | PASS |
| NO HORIZONTAL OVERFLOW | PASS |
| LANGUAGE SWITCH PRESERVED | PASS |
| START PROJECT CTA PRESERVED | PASS |
| MOTION VERSION PRESERVED | PASS |
| NO SECOND ICON LIBRARY | PASS |
| SOURCE DOCUMENTATION | PASS |
| LICENSE DOCUMENTATION | PASS |
| BACKEND UNCHANGED | PASS |
| CMS UNCHANGED | PASS |
| SUPABASE UNCHANGED | PASS |
| LINT | PASS |
| TYPECHECK | PASS |
| VITEST | 20 passed / 0 failed / 0 skipped |
| PLAYWRIGHT | 45 passed / 0 failed / 0 skipped |
| PRODUCTION BUILD | PASS |
| VISUAL QA | 30 screenshots inspected |

