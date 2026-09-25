# Visual Refinement, Live Automation and Performance: Implementation Report

Date: 2026-09-25.

- **Measurements:** all local, taken on production builds (`next build` / `next start`).
- **Evidence** (`.artifacts/refinement/`):
  - `nav-*.json`: click-through navigation
  - `after/*.png`: section screenshots
  - `playwright-final.log`, `vitest.log`, `lint.log`, `build-final.log`
  - `.artifacts/content/metrics-refinement.json`: route metrics
- **Nothing was committed or pushed.**

## Screenshot 01: Insights topics grid
- **Empty gray block removed:** YES.
- **Root cause:**
  - The list painted `background: var(--border)` and drew hairlines with `gap: 1px`.
  - With 7 topics in 5 auto-fit columns, the 3 unfilled cells showed that border-coloured background as a solid gray rectangle.
- **Fix:**
  - Hairlines are now drawn by the cells themselves (`border-inline-end` / `border-block-end`), with the container drawing only its top and start edges.
  - `auto-fill` replaces `auto-fit`, so items keep their width and 07 isn't stretched.
- **Files changed:** `src/components/insights/journal.module.css`.

## Screenshot 02: Work System Flow
- **System Flow live:** YES.
- **Interaction implemented:**
  - All 8 stages are buttons (`aria-pressed`).
  - Click, tap and keyboard focus select a stage; arrow keys move between stages, following the reading direction; Home/End jump to the ends.
  - A mouse hover previews a stage, but only after a real pointer movement and never while a demonstration plays.
  - One lime signal slides along the rail (transform only), and the travelled path is brighter neutral.
  - The connector into the active stage turns lime.
  - The one-line explanation below updates in the same interaction. Its height is reserved for the tallest state, so there's no layout shift.
  - One demonstration runs when the flow first comes into view, then "Replay" / "Pause" text controls.
  - On phones the flow stacks vertically and the signal travels down the rail.
- **Files changed:**
  - `src/components/live/*` (new shared engine and component)
  - `src/app/[locale]/work/page.tsx`: EN/AR stage notes, consistent with the existing sanitized architecture copy
  - `src/app/[locale]/work/work-page.module.css`

## Screenshot 03: Automation by Design
- **Automation by Design live:** YES.
- **Interaction implemented:**
  - Every stage is selectable: click, focus or hover preview. Leaving the list returns to the selected stage.
  - Earlier stages show as "done" (rail and text brighter), the selected stage is lime, and later stages stay neutral.
  - Phase tags: FOUNDATION (01–04), ORCHESTRATION (05), VERIFICATION (06), OPERATION (07), LEARNING (08). All light up when 05 Automation is selected, which is the default. For any other stage, its own phase and 05's tag light.
  - 05 keeps its lime identity.
- **Files changed:**
  - `src/components/process/automation-matrix.tsx` (new)
  - `process.module.css`
  - `process-page.tsx`
  - `src/content/process.ts` (EN/AR phase labels)

## Screenshot 04: Execution model and failure path
- **Workflow live:** YES. **Verify interactive:** YES. **Failure path interactive:** YES.
- **Interaction:**
  - All 7 stages are selectable (click, focus, arrow keys, hover preview). All content stays server-rendered and visible.
  - The readout gives a concrete booking example for the selected stage.
  - **"Run: verified path"** (autoplays once in view) goes EVENT → … → VERIFY ✓ → RECORD → NOTIFY.
  - **"Run: verification fails"** is deterministic: VERIFY ✕, then the connector drops to the failure path in `--danger`. After that come RETRY, then FALLBACK · ALERT · HUMAN (the hand-off chip in `--warning`, dashed), then RECORD → NOTIFY.
  - Labelled "Explanatory model · not connected to a live system". It's local state only: no network, no fake loading.
- **Files changed:**
  - `src/components/process/execution-model.tsx` (new)
  - `process.module.css`
  - `process-page.tsx`
  - `src/content/process.ts` (EN/AR demo trace)

## Screenshot 05: Human + Automation
- **Light section converted to site palette:** YES. It's now rows on the dark ground: a lime code chip, an off-white title and a muted rule, with thin row rules.
- **Tokens used:** `--background`, `--foreground`, `--foreground-secondary`, `--border`, `--border-bright`, `--accent`. The local `--ink` colours were removed.
- **Files changed:** `src/components/process/process.module.css`.

## Screenshot 06: Feedback loop
- **Feedback Loop live:** YES.
- **Interaction implemented:**
  - The ring never rotates; one signal moves (a rotated group, composited).
  - A run steps 01 → 08, crosses the NEW EVIDENCE arc and returns to 01. Passed stages fill, and the arc lights while crossed.
  - Stage buttons (01–08 plus NEW EVIDENCE) and the stages on the ring select immediately, with the stage's meaning shown below.
  - The resting state is NEW EVIDENCE (08 → 01).
  - One demonstration runs in view, then Replay.
- **Files changed:**
  - `src/components/process/feedback-loop.tsx` (new)
  - `process.module.css`
  - `process-page.tsx`
  - `src/content/process.ts` (EN/AR controls)

## Screenshot 07: About automation chain
- **About automation flow live:** YES, using the same SystemFlow component as Work, in its flush variant.
- **Interaction implemented:** identical to the Work flow, with EN/AR step meanings: input enters, logic runs, rules decide, records update, the system acts, the outcome is visible.
- **Files changed:**
  - `src/app/[locale]/about/page.tsx`
  - `about.module.css`
  - `src/content/dictionaries/about.ts`

## Screenshot 08: Relax Moon guardrails
- **Guardrails gray filler removed:** YES.
- **Root cause:** the same gap-on-border-background pattern, with 5 guardrails in 4 columns (3 filler cells) and 1 filler cell at tablet width.
- **Also fixed with the same pattern** wherever the count can leave empty cells:
  - the challenge, decisions, responsibilities and technology grids
  - the journey detail panel (4 or 5 fields)
  - the case-study journey notes and technology list
- **Files changed:**
  - `relax-moon.module.css`
  - `customer-journey.module.css`
  - `src/app/[locale]/work/[slug]/case-study.module.css`

## Screenshot 09: Customer journey
- **Customer Journey live:** YES. **Stage details update instantly:** YES (measured under 100 ms from click to state).
- **Behaviour:**
  - The 8 stages are buttons (click, tap, focus, arrows, hover preview).
  - A lime indicator runs through them once in view, with Pause and Replay text controls; each step takes 0.52 s.
  - The details panel (Input / System action / Decision / Data / Next) updates with each stage, with its height reserved (CLS 0 during the demonstration).
  - Autoplay changes are no longer announced (`aria-live` removed).
  - **Desktop and tablet:** one row. **Phones:** a compact vertical list, with the indicator travelling down the rail and the details underneath.
- **Also:**
  - Fixed stage numbers overlapping the rail: a sized `<button>` centres its content vertically.
  - The journey-notes grid now renders only when the journey has per-stage descriptions. The built-in journey only repeated the 8 titles.
- **Files changed:**
  - `src/components/case-study/customer-journey.tsx`
  - `customer-journey.module.css`
  - `src/app/[locale]/work/[slug]/page.tsx`

## Screenshot 10: Case-study CTA
- **CTA matches site palette:** YES.
  - It uses the `--background` ground with a `--border-bright` top rule, an off-white heading, `--foreground-secondary` supporting text and the lime button.
  - The hardcoded `#08100f` ink was removed.
- **Files changed:** `src/app/[locale]/work/[slug]/case-study.module.css`.

## Screenshot 11: Home Selected Work
- **Selected Work refined:** YES. **Giant lime block removed:** YES.
- **Design:**
  - The archive is now a bordered editorial panel on the dark ground: INDEX / WORK marker, "Work archive" title and supporting line, a metadata line (SYSTEMS · WORKFLOWS · ARCHITECTURE) and a lime "Explore work →".
  - **Hover and focus:** the border tints lime, the top rule extends, the marker fills, the metadata brightens and the arrow shifts 4 px (mirrored in RTL).
  - The project card's glow was removed, and its hardcoded colours moved to tokens.
- **Root cause behind the screenshot:**
  - Home had no project fallback, so during a CMS outage it listed no project and no featured case study, and the archive tile was all that was left.
  - Home now uses the same built-in showcase fallback as the Work page and the case study: existing content, not a placeholder.
- **Files changed:**
  - `src/components/sections/homepage.tsx`
  - `homepage.module.css`
  - `src/app/[locale]/page.tsx`

## Performance
- **Previous internal navigation behaviour:**
  - Home, Services, Work, Insights, Technologies and the case study were dynamic. Only because every public CMS read used the cookie-bound Supabase client, every visit, including repeats, waited for a server render plus sequential CMS round trips, and those routes couldn't be fully prefetched.
  - Measured on production with 150 ms CMS latency: **330–883 ms** per click (median 336 ms). Static routes took 33–110 ms.
  - The cost scales with CMS latency, and the case study makes 3 sequential queries.
- **New internal navigation behaviour:**
  - Public reads use a cookie-less publishable-key client, so the public routes are statically generated (60 s revalidation plus on-demand admin revalidation) and fully prefetched.
  - **Desktop EN:** median 41 ms, max 176 ms. **Arabic:** median 45 ms, max 223 ms. **Mobile:** 38–186 ms, measured from the link tap.
  - Repeat visits are equally fast, and the results don't depend on CMS latency.
  - Pages come back as `x-nextjs-cache: HIT` in 8–14 ms.
- **Kept per request:** case studies other than the showcase, and insight articles. A CMS failure there must reach the in-site error page, which a statically generated path can't render (a failed first generation is a bare 500). The showcase got its own static segment.
- **Artificial delays found:** none blocking navigation or tabs.
  - The remaining timers are in-view demonstration sequences (featured case study, booking demo, service preview, AutomationLab), a 90 ms hover intent in the service list, and the new diagrams' playback.
- **Artificial delays removed:** none were needed. All new selections update in the same interaction.
- **Heavy dependencies identified:**
  - `three` and `postprocessing` (PixelBlast hero backgrounds, loaded on demand), `motion` (6 components) and `lucide-react`. All are in use.
  - `whatsapp-demo.tsx` is unused, with no bundle cost; it's left in place.
- **Dependencies removed:** none, all are used. No new dependencies were added.
- **Client boundaries:**
  - The Process page body stays server-rendered, with 4 small islands.
  - The new client code is 4.3 KB gzipped for the shared flow and engine, and 8 KB for all Process islands, including the existing stage navigator.
  - No page was turned into a client component.
- **Route prefetch verified:** YES. The defaults (`auto`) are unchanged; there are no `prefetch={false}` and no `window.location` navigations.
- **Image and font optimization changes:** none needed. Fonts were already self-hosted Tajawal, preloaded only for Arabic, with an immutable cache; there are no large images on these routes.
- **Animation performance changes:**
  - Transform and opacity only, no animation-frame loops, a single shared IntersectionObserver.
  - Each demonstration runs once, stops offscreen or when the tab is hidden, and doesn't autoplay under reduced motion.
  - Measured with a hardware GPU: **0 long tasks** during every demonstration (Process, Work, case study, About; 1440 and 390), and **0 DOM mutations** once they finish.
- **Production build result:** PASS. All 19 public pages are `●` (SSG with 1 min revalidation), the sitemap revalidates every minute, and admin and the API stay dynamic.
- **Bundle observations:**
  - Page-own JS grew only by the islands above.
  - Transferred JS in the first 2.5 s is higher on most routes (+4 to +82 KB compared with `metrics-nodock.json`), because static header destinations are now prefetched in full, including their chunks, at idle.
  - That's the mechanism that makes navigation instant; it's a deliberate trade-off.
- **Core Web Vitals (lab):**
  - CLS 0 on all 18 routes × 2 widths. LCP 84–536 ms; the single 536 ms reading was /en/process at 1440 in one sample.
  - Click to state change under 100 ms for all diagrams. Zero console or page errors.

## Responsiveness
PASS at every width in the brief (the report template lists ten of them):

- 320, 360, 375, 390, 412, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px
- landscape (844 × 390)
- English, Arabic, RTL and reduced motion

These are automated no-overflow checks on Work, Process, About, the case study, Home and Insights in both locales. Section screenshots cover 1440 and 390, EN and AR.

## Accessibility
- **Keyboard:**
  - Tab reaches every stage button; Enter and Space activate.
  - Arrow keys move along each flow in the reading direction (Down/Up when stacked); Home/End work.
  - Focusing a stage selects it.
- **Focus states:** a visible 2 px lime outline on every stage, chip and control.
- **Semantic controls:**
  - Native buttons with `aria-pressed`, in named lists or groups. The Process stage navigator keeps its tabs pattern.
  - No `div` click handlers; the ring's SVG nodes are a pointer shortcut alongside the real buttons.
- **Reduced motion:** no autoplay, no travelling transitions (the 0.01 ms global rule), and selection and states fully work.
- **Screen readers:**
  - Demonstrations don't announce; the journey's `aria-live` was removed.
  - The active stage's button is described by its explanation (`aria-describedby`).
  - The reserved-height sizers are `aria-hidden` and `inert`.
  - All content remains in the server HTML.

## Regression check
- **Existing routes preserved:** YES. The showcase moved to a static segment at the same URL.
- **Existing content and project data preserved:** YES. The only additions are EN/AR explanatory copy; the redundant empty journey-notes grid is hidden.
- **Header, Process navigation, language switch and Start a project preserved:** YES.
- **Bottom Dock still removed:** YES.
- **Forms preserved:** YES (untouched).
- **No console errors, no hydration errors, no horizontal overflow:** YES.

## Tests
- **Browser (production suite):** 127/127.
  - That's 89 existing tests, the outage spec now having 5 tests, plus the new `live-systems.spec.ts`.
  - `cms-outage.spec.ts` was updated. The old first test asserted that the first request during an outage waits over 6 s. Now:
    - all public pages must respond in under 2 s even during an outage;
    - the retry and breaker behaviour is asserted on a route that still reads on demand.
- **Unit:** 37/37 (a new parity test for the Process demo content).
- **Lint:** 0 errors (2 existing homepage warnings). **Typecheck:** PASS.
- **Other public specs,** normally run only against the dev config, run once against production: 68 passed and 11 failed.
  - All 11 are outside this change:
    - four service anchor tests hardcode `localhost:3000` and expect CMS-only slugs (`#mobile-applications`, where the built-in fallback id is `#mobile`);
    - four pixel-tight service-preview layout and signal checks, on components that weren't touched;
    - `insights.spec` expects the English 404 label on the Arabic 404.
  - There are no commits, so a pre-change baseline couldn't be run; each failure was analysed instead.

## Files
**New**
- `src/lib/supabase/public.ts`: cookie-less publishable-key client for public reads.
- `src/server/revalidate-public.ts`: on-demand revalidation of every public page and the sitemap.
- `src/components/live/use-live-flow.ts`: shared engine (playback, the shared observer, reduced motion, keys, hover intent).
- `src/components/live/live-parts.tsx`, `live.module.css`: readout with reserved height, and the text playback control.
- `src/components/live/system-flow.tsx`, `system-flow.module.css`: the live linear flow (Work, About).
- `src/components/process/automation-matrix.tsx`, `execution-model.tsx`, `feedback-loop.tsx`: the live Process diagrams.
- `src/app/[locale]/work/relax-moon-spa-automation/page.tsx`: static showcase segment.
- `src/app/[locale]/work/[slug]/showcase.ts`: shared showcase slug.
- `tests/e2e/live-systems.spec.ts`: live diagrams, gray-block fixes, palette, gateway, 16 widths, landscape, navigation speed.

**Modified**
- `src/server/queries/public-content.ts`: public reads use the public client.
- `src/app/[locale]/page.tsx`: `revalidate`, and the showcase fallback on Home.
- `src/app/[locale]/services/page.tsx`, `technologies/page.tsx`, `insights/page.tsx`: `revalidate`.
- `src/app/[locale]/work/page.tsx`: `revalidate`, SystemFlow, EN/AR stage notes.
- `src/app/[locale]/work/work-page.module.css`: old static flow removed; card surfaces moved to tokens.
- `src/app/[locale]/work/[slug]/page.tsx`: per request (`force-dynamic`); journey notes only with descriptions.
- `src/app/[locale]/work/[slug]/case-study.module.css`: dark CTA; hairline grids.
- `src/app/[locale]/insights/[slug]/page.tsx`: per request (`force-dynamic`, as before in practice).
- `src/app/[locale]/about/page.tsx`, `about.module.css`, `src/content/dictionaries/about.ts`: live chain and EN/AR step notes.
- `src/app/sitemap.ts`: `revalidate`.
- `src/content/process.ts`: EN/AR phases, demo trace, loop controls.
- `src/components/process/process-page.tsx`, `process.module.css`: islands, dark boundary, live states.
- `src/components/case-study/customer-journey.tsx`, `customer-journey.module.css`: the live journey.
- `src/components/case-study/relax-moon/relax-moon.module.css`: hairline grids.
- `src/components/insights/journal.module.css`: hairline topics grid.
- `src/components/sections/homepage.tsx`, `homepage.module.css`: the work gateway.
- `src/app/admin/cms/actions.ts`, `src/app/admin/projects/actions.ts`: admin saves revalidate the public site.
- `tests/unit/public-content-errors.test.ts`: mocks the public client.
- `tests/unit/process-content.test.ts`: demo content parity.
- `tests/e2e/cms-outage.spec.ts`: outage behaviour of static pages.
- `tests/fixtures/operations-server.mjs`: optional `CMS_FIXTURE_LATENCY_MS`, diagnostics only (default 0).
- `playwright.performance.config.ts`: adds `live-systems.spec.ts`.

## Remaining issues
- **Freshness now works differently.**
  - Admin saves still appear immediately (on-demand revalidation).
  - Changes made outside the admin (for example directly in Supabase), or recovery after a CMS outage, appear within about 60 s: the next visit after that serves the cached page and refreshes it in the background.
- **Build-time content.**
  - Pages are prerendered with whatever the CMS returns at build time. This build ran while the CMS hostname didn't resolve (`ENOTFOUND`), so it contains the built-in fallback content until the first successful revalidation.
- **Other case studies and insight articles are still per request.**
  - Only the showcase is static. Other case studies and insight articles still wait for the CMS on each visit, as before; they show the loading state instantly.
- **Development mode is unchanged by design.**
  - `next dev` renders every page on demand, so it will stay slower than production.
  - Earlier measurement on your dev server: 100–470 ms per click with the CMS breaker open.
- **Stale specs, not caused by this pass:** `technologies.spec.ts`, `visual-responsive.spec.ts`, and the 11 specs listed under Tests.
