# Insights redesign acceptance — 2026-09-05

Implemented at http://localhost:3000/en/insights and http://localhost:3000/ar/insights. The development server remains running on port 3000.

| Acceptance item | Result | Evidence / limit |
| --- | --- | --- |
| Insights index design | PASS | Dark editorial composition, off-white panel and acid-lime technical artwork |
| Editorial hero | PASS | Compact opening; main content starts within first desktop viewport |
| Featured insight | PASS | Newest published article, CMS cover preferred; private fixture visual QA |
| Article index | PASS | Full-width numbered rows, linked titles, dates when present |
| Category filter | PASS | Actual CMS values only; combined category/search integration test |
| Search | NOT NEEDED | No real published articles; automatically available at five articles and tested privately |
| Article detail | PASS* | Reader, category/date/author, cover, safe text blocks, related articles, CTA |
| Typography | PASS | Responsive display titles; 17–19px prose, 74ch measure, 32–48px H2 |
| Arabic | PASS | Localized copy, inherited Arabic font, independent line-height and title wrapping |
| RTL | PASS | Logical borders/alignment and mirrored action arrows |
| Mobile | PASS | No document overflow at 1920, 1440, 1024, 768, 430, 390, 375, 320 |
| Empty state | PASS | Genuine empty state; distinct service-unavailable message for query failure |
| CMS integration | PASS | Existing published queries, media RLS, admin publishing and preview tests preserved |
| SEO | PASS | Localized titles/descriptions, canonical/hreflang, article Open Graph; existing sitemap unchanged |
| Accessibility | PASS | Semantic headings/articles, keyboard controls, focus indicators, live filter count, reduced-motion CSS, 48px filter/arrow targets; manual/component scope, not a formal audit |
| Build | PASS | npm run build |

*No genuine published insight exists, so real-published-slug screenshots could not be captured. The real admin/publish/detail flow passed in the existing Playwright test, with its temporary test record cleaned up by that test. Reader visual QA uses isolated local HTML fixtures rendering the actual route component with mocked query results, not published CMS content. CMS cover-image and related-content branches are implemented but have no real published records for visual verification.

## CMS record handling

The sole published record was `ui-insight-1788516563751`, English title `UI verified insight`, category `Verification`, publication date `2026-09-04T10:09:44.589+00:00`. Its exact title, excerpt and slug pattern match `tests/e2e/phase4b-admin.spec.ts` test creation code.

Archived this exact record with guarded slug/title/published-status conditions. It was not deleted. No broad keyword suppression was introduced, so legitimate intentionally published articles containing words such as “test” remain eligible. Final anonymous query returned zero published insights. No placeholder or test content remains visible on the public Insights pages. The archived detail route renders Not Found and noindex in both locales (Next.js streamed responses may carry HTTP 200).

No real editorial CMS records were available or invented. Author, date and category values are never fabricated in the public UI. Publication date and published cover media now flow through the existing public query.

## Verification

- `npm run lint`: PASS, no warnings after removing an unused private QA script import.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 9 files / 18 tests.
- `npm run build`: PASS.
- Existing Playwright coverage: 13 / 13 PASS, including CMS, secure preview, publish/unpublish/archive, contact, public navigation, Arabic and homepage mobile coverage.
- New Insights Playwright coverage: 2 / 2 PASS after correcting assertions for documented Next.js streamed Not Found responses and scoped noindex metadata.
- Private populated-index and reader overflow checks: PASS for both locales at all eight requested widths.
- Screenshots inspected for hero spacing, hierarchy, contrast, Arabic wrapping, article rows and reader prose/code layout.

## Application files changed

- `src/app/[locale]/insights/page.tsx`
- `src/app/[locale]/insights/[slug]/page.tsx`
- `src/components/insights/insights-index.tsx`
- `src/components/insights/insights-index.module.css`
- `src/components/insights/journal.tsx` (new shared visual/copy/CTA)
- `src/components/insights/journal.module.css` (new scoped styles)
- `src/lib/insights/publication.ts` (optional cover type)
- `src/server/queries/public-content.ts` (Insights dates and published cover media only)
- `tests/integration/insights-index.test.tsx` (new)
- `tests/e2e/insights.spec.ts` (new)

The workspace was entirely untracked at the start; existing files were preserved in place. Global header, logo, navigation, footer, styles, admin, schema, Supabase configuration and RLS were not edited.

## Screenshots

All screenshots are full-page captures using 1440×900 or 390×844 viewports, stored alongside this report.

Actual localhost pages:
- [English desktop](en-index-1440.png)
- [English mobile](en-index-390.png)
- [Arabic desktop](ar-index-1440.png)
- [Arabic mobile](ar-index-390.png)

Private populated-index fixtures, never published:
- [English desktop](en-populated-fixture-1440.png)
- [English mobile](en-populated-fixture-390.png)
- [Arabic desktop](ar-populated-fixture-1440.png)
- [Arabic mobile](ar-populated-fixture-390.png)

Private reader fixtures, never published:
- [English desktop](en-detail-fixture-1440.png)
- [English mobile](en-detail-fixture-390.png)
- [Arabic desktop](ar-detail-fixture-1440.png)
- [Arabic mobile](ar-detail-fixture-390.png)

The in-app browser connection was unavailable. Playwright provided screenshots and browser verification. Reproducible private fixture generation/capture scripts are `.artifacts/insights-fixture.mjs` and `.artifacts/insights-capture.mjs`; their HTML outputs remain under `.artifacts/insights` and are not Next.js public routes.
