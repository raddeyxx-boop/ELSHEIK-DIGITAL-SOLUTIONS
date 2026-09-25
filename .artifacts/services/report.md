# Services interaction — acceptance report

Implemented on `/en`, `/ar`, `/en/services`, and `/ar/services`.

## Implementation

The approved homepage row and Services detail styles are reused directly. Titles, descriptions, numbering, separators, container widths, and existing destinations are preserved. The server still fetches the existing published CMS service records and uses the existing dictionaries as its fallback.

Desktop uses the available fourth column on the homepage and space beside the action on the Services page. A 90 ms hover-intent delay prevents accidental flashes. Keyboard focus on the existing link activates the same preview immediately. The previous preview fades out over 220 ms; its primary animation stops immediately. The next preview enters over 220 ms with a small vertical offset. Escape dismisses a preview without moving focus.

At widths up to 900 px or on devices without hover, a localized Preview / Close preview button provides a separate action. Existing links navigate normally. The active visual expands into a controlled 160 px region beneath the content. Closed row dimensions remain unchanged; the preview affordance occupies existing space. The homepage retains its original responsive content visibility.

Only an active preview mounts its demonstration. Sequences run once and settle, restarting on the next activation. One short hover timer and one observer for the active row are used; there are no per-frame React updates or six background animation loops. Leaving the viewport or hiding the document dismisses the active preview.

Reduced-motion mode displays completed static interfaces and diagrams with no moving signals. Arabic labels and accessible descriptions use localized component content; technical diagrams retain their logical processing direction. API remains API.

## Created components

| Component | Demonstration |
| --- | --- |
| ServiceList | Shared compact/detail interaction controller; existing links and CMS data |
| ServicePreview | Accessible preview, motion preference, entrance and exit |
| WebDevelopmentPreview | Browser shell, layout grid, header, hero, CTA, content modules and completion |
| WebApplicationPreview | Operational sidebar, loaded records, changing statuses, responding chart and completed action |
| MobileApplicationPreview | Phone frame, app content, confirmation action, completed status and bottom navigation |
| AutomationPreview | Request → workflow → API → database → notification, with five icons, traveling signal and arrival-triggered 450 ms pulses |
| AIPreview | Three input signals converge, processing activates, alternatives appear and one output is selected and pulsed |
| CustomSoftwarePreview | Operations, customers, payments and reporting modules connect into one custom system |

Service previews are implemented as small SVG interfaces in `service-preview.tsx`; no stock imagery, videos, canvas, WebGL, sound or cursor effects are used. Existing Motion and Lucide dependencies are reused. **Dependencies added: none.**

## Exact source files

Modified:

- `src/components/sections/homepage.tsx` — replace only the services-row rendering with ServiceList.
- `src/app/[locale]/services/page.tsx` — retain the server query and page hero; render the existing detail content through ServiceList.

Created:

- `src/components/services/service-list.tsx`
- `src/components/services/service-list.module.css`
- `src/components/services/service-preview.tsx`
- `src/components/services/service-preview.module.css`
- `src/components/services/preview-content.ts`
- `tests/e2e/services-preview.spec.ts`

The original homepage and Services page CSS files were not modified. No backend, schema, RLS, authentication, admin, navigation, SEO or dependency files were modified.

## Verification

Every service was activated in both languages on both the homepage and Services page. The layout tests cover 1920×1080, 1440×900, 1280×800, 1024×768, 430×932, 390×844, 375×812 and 320×568. They check resting geometry against the original markup using the unchanged original styles, active preview containment, absence of text/action overlap, and document overflow. Pre-change screenshots and measurements are also retained; zero-height entries captured before initial rendering are not used as geometry evidence.

Interaction tests cover all six preview mappings, switching, a single active demonstration, actual signal movement and arrival pulses, icons, keyboard Tab/Enter/Escape, anchor destinations, touch preview without navigation, deliberate touch navigation, offscreen cleanup, both locales and reduced motion.

Verification results: `npm run lint` PASS; `npm run typecheck` PASS; `npm test` PASS (18 tests in 9 files); `npm run build` PASS; complete Playwright suite PASS (36 tests, including all 26 existing tests and 10 Services tests). The four layout tests also passed again after adding explicit reduced-motion node-position assertions (all eight viewport sizes, both locales, both layouts).

## Acceptance matrix

| Requirement | Result |
| --- | --- |
| Current Services design preserved | PASS |
| Web Development preview | PASS |
| Web Applications preview | PASS |
| Mobile Applications preview | PASS |
| Automation preview | PASS |
| AI preview | PASS |
| Custom Software preview | PASS |
| Service-specific visuals | PASS |
| Hover activation | PASS |
| Keyboard activation | PASS |
| Mobile interaction | PASS |
| Preview transitions | PASS |
| Automation signal | PASS |
| Automation node pulse | PASS |
| Automation node icons | PASS |
| Arabic | PASS |
| RTL | PASS |
| Reduced motion | PASS |
| No overflow | PASS |
| Performance: one active, finite sequence | PASS |
| Existing navigation | PASS |
| CMS regression | PASS |
| Accessibility: native controls, focus, descriptions and reduced motion | PASS |
| Playwright | PASS |
| Lint | PASS |
| Typecheck | PASS |
| Unit/integration tests | PASS |
| Production build | PASS |

## Screenshots

All screenshots are in this directory. The final `verified-*` images show completed reduced-motion states; `motion-*` images show normal-motion activation. Both sets cover all six services in both languages and both page layouts. Verified captures include desktop 1440 px and mobile 390 / 320 px.

| Example | English desktop | Arabic desktop |
| --- | --- | --- |
| Web Applications | [Dashboard](verified-en-1440-detail-apps.png) | [Dashboard](verified-ar-1440-detail-apps.png) |
| Mobile Applications | [Mobile app](verified-en-1440-detail-mobile.png) | [Mobile app](verified-ar-1440-detail-mobile.png) |
| Automation | [Workflow](verified-en-1440-detail-automation.png) | [Workflow](verified-ar-1440-detail-automation.png) |
| AI & Intelligent Systems | [Decision network](verified-en-1440-detail-ai.png) | [Decision network](verified-ar-1440-detail-ai.png) |

Mobile examples: [English phone, 320 px](verified-en-320-detail-mobile.png), [Arabic phone, 390 px](verified-ar-390-detail-mobile.png), [Arabic workflow, 320 px](verified-ar-320-home-automation.png).

## Practical limits

- Browser verification used Chromium, including touch emulation; physical iOS/Android devices and Safari/Firefox were not tested.
- These are deterministic capability demonstrations, not live backend transactions.
- A newly introduced CMS service slug needs an explicit preview mapping. Unrecognized services retain their content and navigation without displaying an unrelated demonstration.
- If the dictionary fallback supplies technical hints in the homepage fourth column, those hints fade out while its desktop preview is active and return afterward. Titles and descriptions remain unchanged.
