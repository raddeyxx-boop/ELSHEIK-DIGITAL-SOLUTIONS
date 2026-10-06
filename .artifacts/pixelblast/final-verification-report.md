# PixelBlast and global palette — final verification

Verified against the preserved working tree on 2026-09-10. No application source was changed during this verification continuation. The final Work palette CSS (12:09:17) predates the successful production build log (12:09:45); that build was reused.

## Results

| Check | Result |
|---|---|
| GLOBAL HERO MOTION SYSTEM | PASS |
| RECOVERY FROM INTERRUPTED STATE | PASS |
| HOME BACKGROUND | PASS |
| SERVICES BACKGROUND | PASS |
| WORK BACKGROUND | PASS |
| ABOUT BACKGROUND | PASS WITH FALLBACK |
| INSIGHTS BACKGROUND | PASS WITH FALLBACK |
| CONTACT BACKGROUND | PASS |
| CASE STUDY BACKGROUND | PASS |
| PIXELBLAST | PASS |
| ASCII WAVES INSTALLATION | BLOCKED |
| ASCII WAVES INTEGRATION | BLOCKED |
| REACTBITS LICENSE STATUS | NOT CONFIGURED |
| FIELD NOTES PURPLE REMOVED | PASS |
| FIELD NOTES DARK PALETTE | PASS |
| NEXT MOVE BRIGHT PANEL REMOVED | PASS |
| NEXT MOVE DARK PALETTE | PASS |
| NEXT MOVE FOOTER TRANSITION | PASS |
| WORK SHOWCASE CREAM REMOVED | PASS |
| WORK SHOWCASE VIOLET REMOVED | PASS |
| WORK SHOWCASE DARK PALETTE | PASS |
| WORK SHOWCASE LIME ACCENT PRESERVED | PASS |
| WORK SHOWCASE LAYOUT PRESERVED | PASS |
| WORK SHOWCASE FUNCTIONALITY PRESERVED | PASS |
| FULL HOMEPAGE COLOR CONTINUITY | PASS |
| ELSHEIK ACCENT #CAFF4A | PASS |
| MOBILE HERO MOTION VISIBILITY | PASS |
| MOBILE MOTION FRAME DIFFERENCE | PASS |
| MOBILE LAYOUT STABILITY | PASS |
| MOBILE PERFORMANCE TUNING | PASS |
| ENGLISH | PASS |
| ARABIC | PASS |
| RTL | PASS |
| 1920×1080 | PASS |
| 1440×900 | PASS |
| 1366×768 | PASS |
| 1024×768 | PASS |
| 768×1024 | PASS |
| 390×844 | PASS |
| 375×812 | PASS |
| CTA CLICKABILITY | PASS |
| REDUCED MOTION | PASS |
| REDUCED MOTION CANVAS COUNT | 0 |
| WEBGL FALLBACK | PASS |
| VISIBILITY PAUSING | PASS |
| NO DUPLICATE CANVAS | PASS |
| ROUTE CLEANUP | PASS |
| CASE STUDY ROUTE CLEANUP | PASS |
| LOCALE SWITCH CLEANUP | PASS |
| NO WEBGL LEAK | PASS in the instrumented route sequence |
| NO HYDRATION ERROR | PASS |
| NO HORIZONTAL OVERFLOW | PASS |
| SERVICE PREVIEWS PRESERVED | PASS |
| BACKEND UNCHANGED | PASS |
| CMS UNCHANGED | PASS |
| SUPABASE UNCHANGED | PASS |
| LINT | PASS; 0 errors, 3 preexisting warnings |
| TYPECHECK | PASS |
| VITEST | 20 passed / 0 failed / 0 skipped |
| PLAYWRIGHT | 60 passed / 0 failed / 0 skipped (5.6 minutes) |
| PRODUCTION BUILD | PASS |
| VISUAL QA | 71 source screenshots inspected, plus 2 motion difference images |

The 71 inspected screenshots comprise the 63 previously reviewed source captures, four additional final mobile Work/case-study EN/AR captures, and four new mobile motion frames. Composite images were also reopened; repeated views are not counted again. The broader automated capture set covers 140 page/locale/viewport combinations, with the final 42 mobile captures refreshed after the eased mask. Each recorded one canvas, no horizontal overflow and no captured browser errors. This does not imply that all 140 were individually inspected.

## Mobile motion

At 390×844, screenshots separated by 8,000 ms showed actual ambient changes: Services 344 pixels (0.215% of the image), Contact 170 pixels (0.110%). Visual difference: YES. Layout shift: NO observed between sampled frames. Text remained stable: YES; heading bounds were identical and difference images contain no moving text outlines. Motion intensity: SUBTLE. The initial 2.5-second Contact sample at 375px was identical; the longer comparison resolved the uncertainty without changing application code.

Both routes returned zero canvases after enabling reduced motion. Existing reduced-motion tests additionally verify a visible static field and no WebGL context creation. Mobile DPR is 1, density is 90% of the page preset, speed 75%, opacity 85%, and ripple intensity 70%. Rendering is capped at 30 fps; this concurrent Chromium run measured approximately 22 fps, not a guaranteed device frame rate. The deferred production chunk measured 143,051 bytes gzipped (approximately 140 KiB), absent from reduced-motion loading.

## Files

Modified during this continuation: `.artifacts/pixelblast/motion-check.mjs` (390px viewport, eight-second comparison, decoded pixel differences, stable heading geometry, reduced-motion count); refreshed QA logs, motion images/results and hash comparison. No application or test source edits in this continuation.

Final existing application files modified by the feature:

- `src/app/globals.css`
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/insights/page.tsx`
- `src/app/[locale]/services/page.tsx`
- `src/app/[locale]/work/page.tsx`
- `src/app/[locale]/work/[slug]/page.tsx`
- `src/components/sections/homepage.module.css`
- `src/components/sections/homepage.tsx`
- `src/components/sections/page-hero.tsx`
- `package.json` and `package-lock.json`

Feature files created: `components.json`; `src/components/backgrounds/hero-pixel-background.tsx`, `hero-pixel-background.module.css`, `hero-pixel-presets.ts`; `src/components/backgrounds/pixel-blast/pixel-blast.tsx`, `pixel-blast.module.css`, `LICENSE.md`, `SOURCE.md`.

Test file created and expanded earlier: `tests/e2e/pixel-background.spec.ts`. Its route/case-study/locale cleanup assertions were preserved.

QA-only files created in this continuation: this report and `motion-services-diff.png`, `motion-contact-diff.png`. Existing `motion-{services,contact}-{a,b}.png`, `motion-results.json`, `changed-files.json` and test logs were updated.

Dependencies added by the feature: `three` ^0.185.1, `postprocessing` ^6.39.4, development `@types/three` ^0.185.4. None added during this continuation.

## Hero engine map

| Page | Engine |
|---|---|
| Home | PixelBlast, system preset |
| Services | PixelBlast, capabilities preset |
| Work | PixelBlast, diamond preset |
| About | PixelBlast FALLBACK, calm preset; ASCII Waves blocked |
| Insights | PixelBlast FALLBACK, data preset; ASCII Waves blocked |
| Contact | PixelBlast, signal/ripple preset |
| Relax Moon Spa case study | PixelBlast, restrained case-study preset |

## Final colors

Page background `--background: #09090c`; elevated graphite `--background-elevated: #101014`; surface `--surface: #16161b`; primary text `--foreground: #f0eee7`; secondary text `--foreground-secondary: #b2b1b7`; muted text `--muted: #92919a`; accent `--accent: #caff4a`.

Work showcase: cream/light surface and violet illustration gradients became dark token surfaces and neutral/dark illustration gradients with existing lime accents. Layout, copy and functionality were preserved.

Field Notes: legacy purple became graphite #101014, lime and off-white. Next Move: disconnected cream became #16161b with off-white text, lime CTA and dark footer transition. Existing intentional lime sections remain. Relevant CSS was inspected; the unused/overridden legacy hero radial declaration is suppressed by the active scoped hero background, not a visible purple panel. No arbitrary global replacement was made.

## License blocker

ASCII Waves was not installed because the React Bits registry requires authorization and `REACTBITS_LICENSE_KEY` is not configured locally. Its presence was checked without printing secrets; the registry was not retried. No substitute was falsely labeled as ASCII Waves. The existing About and Insights fallback backgrounds were retained. PixelBlast was adapted from the actual official React Bits source with its attribution/license retained.

## Safety and evidence

The recovery SHA-256 baseline was compared against current `src` and `supabase` files: only the ten listed existing frontend source files differ. Backend/API, CMS/admin, auth, server actions and Supabase files remain unchanged. The entire repository is untracked, so Git alone cannot establish a historical baseline.

Five backend-writing tests were intentionally excluded: three in `live-backend.spec.ts` and two in `phase4b-admin.spec.ts`. These tests mutate Supabase/admin/CMS state and remain outside this UI-only verification scope. They are exclusions, not runner skips.

Artifacts (relative to this report):

- [English homepage composite](homepage-scroll-en.png)
- [Arabic homepage composite](homepage-scroll-ar.png)
- [Screenshot gallery](index.html)
- [Mobile motion measurements](motion-results.json)
- [Services frame 1](motion-services-a.png), [frame 2](motion-services-b.png), [amplified difference](motion-services-diff.png)
- [Contact frame 1](motion-contact-a.png), [frame 2](motion-contact-b.png), [amplified difference](motion-contact-diff.png)
- [Existing expanded route verification](route-final.log)
- [Final frontend suite](frontend-final.log)
- [Lint](lint.log), [typecheck](typecheck.log), [Vitest](vitest.log), [production build](build.log)
- [Source hash comparison](changed-files.json)

The verified navigation includes Home → Services → Work → About → Insights → Contact → Work → case study → Home → Arabic Home. Work is the real navigation bridge from Contact to the case study. Instrumentation confirms one live context at each completed route and release of previous contexts; this is not a long-duration GPU memory profile.

Known limitations: ASCII Waves authorization remains unavailable; browser QA used Chromium with emulated viewports/software GPU rather than physical mobile hardware; lint retains three preexisting unused-variable warnings (`Arrow`, `fieldThemes`, `startSignals`); Git has no tracked baseline. No deployment was performed.
