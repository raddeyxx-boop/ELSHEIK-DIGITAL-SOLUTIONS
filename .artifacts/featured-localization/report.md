# Featured Relax Moon Spa Arabic localization verification

Date: 2026-09-05

| Check | Result |
| --- | --- |
| ARABIC SLOGAN | PASS |
| ARABIC PIPELINE | PASS |
| ARABIC PHONE HEADER | PASS |
| ARABIC CONVERSATION | PASS |
| RTL FORMATTING | PASS |
| ARABIC DESKTOP | PASS |
| ARABIC MOBILE | PASS |
| ENGLISH REGRESSION | PASS |
| DESIGN UNCHANGED | PASS |
| ANIMATIONS UNCHANGED | PASS |
| BUILD | PASS |

Arabic slogan is exactly two lines: “راحة العميل،” / “مدعومة بالأتمتة”. All seven pipeline labels, both phone-header labels and all six conversation messages use the requested Arabic strings. English retains every original string, including punctuation.

Localized strings use the existing typed EN/AR dictionaries, passed from Homepage to FeaturedCaseStudy. The approved main case-study text and CTA are preserved. Arabic text has explicit RTL formatting. An Arabic-only number text inset reserves space for existing completion checkmarks without repositioning the icons, stage dots or pipeline line. Numerals remain 01–07. The Arabic slogan keeps its original position and size, with two natural lines and appropriate Arabic line-height.

## Comparison evidence

Before/after captures at 1440×900 and 390×844 show:
- English section pixels and visible text are exactly identical at both widths.
- All four panel bounds, stage-row bounds, dot offsets, pipeline border width and CTA bounds are identical before/after in both locales.
- No document overflow or clipped Arabic text.
- Six completion checkmarks and all messages appear after the original seven-stage animation, with no number/checkmark overlap.
- Reduced-motion mode still exposes every message.

See [comparison.json](comparison.json) for measured results. Captures hide only the unrelated sticky global header, skip link and development overlay so those do not obscure the section. No application styles were changed for this capture isolation.

## Checks executed

- npm run lint: PASS, no warnings.
- npm run typecheck: PASS.
- npm test: PASS, 9 test files / 18 tests.
- npm run build: PASS.
- Focused localization Playwright: 4 / 4 PASS after final Arabic-number formatting adjustment.
- Existing case-study interactive demo and homepage responsive coverage: 6 / 6 PASS.

## Exact application/test files modified

1. src/content/dictionaries/types.ts
2. src/content/dictionaries/en.ts
3. src/content/dictionaries/ar.ts
4. src/components/case-study/featured-case-study.tsx
5. src/components/sections/homepage.tsx
6. src/components/sections/homepage.module.css
7. tests/e2e/featured-localization.spec.ts (new)

No database, CMS, RLS, API, authentication, routing, SEO, publishing, preview, or interactive booking logic was changed. Animation timing, progression and CSS transitions remain unchanged; the effect dependency list now includes the dictionary's fixed seven-step length.

## Screenshots

| Locale / width | Approved baseline | Localized result | Completed animation |
| --- | --- | --- | --- |
| English / 1440 | [Before](before-en-1440.png) | [After](after-en-1440.png) | [Animation](animated-en-1440.png) |
| English / 390 | [Before](before-en-390.png) | [After](after-en-390.png) | [Animation](animated-en-390.png) |
| Arabic / 1440 | [Before](before-ar-1440.png) | [After](after-ar-1440.png) | [Animation](animated-ar-1440.png) |
| Arabic / 390 | [Before](before-ar-390.png) | [After](after-ar-390.png) | [Animation](animated-ar-390.png) |

QA artifacts added under .artifacts/featured-localization/: capture.mjs, compare.mjs, comparison.json, this report, eight before/after geometry JSON files and twelve screenshots. The screenshot scripts are local QA tools only.
