# Commercial operations demo verification — 2026-09-24

The existing six-tab implementation and case-study integration remain intact. No production application changes were needed in this final continuation.

## Preserved fixes
- views.tsx: the Overview EventList prop spread previously replaced the three-event slice. The corrected ordering remains intact; the new regression check asserts three Overview events and more than three in full Activity.
- relax-moon-spa-demo.tsx: decorative tab numbers remain aria-hidden.

## Results
- Vitest: 22 passed, 0 failed, across 11 files, including both demo reducer tests.
- Playwright: 20 passed, 0 failed. Four complete localized desktop/mobile workflows and sixteen additional responsive cases.
- Lint: exit 0; three existing unused-variable warnings in homepage.tsx.
- Typecheck: exit 0.
- Normal production build: exit 0, using normal configuration without the test fixture.
- No unexpected production operational requests, console errors or page errors during the isolated suite.

Both locales tested at 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 430×932, 390×844, 375×812 and 360×800. No horizontal page overflow was detected. Checks cover six tabs, branch restoration, search/status filtering, multiple booking details, assignment synchronization, availability, customer history, activity filtering, completion/cancellation, derived metrics, reset, keyboard tab navigation, Escape/focus restoration and reduced motion.

## Isolation
tests/fixtures/operations-server.mjs supplies only local public seed content to the test Next process. Production source/configuration does not import it. The dashboard uses fictional local reducer state and has no operational API client. Forbidden attempts are recorded and fail assertions, not silently ignored. No test-CMS identifiers (demo-project, demo-only, 127.0.0.1:3101) were found in production .next/server or .next/static output.

## Visual review
21 screenshots inspected in this directory: the 15 requested EN/AR representative states plus EN/AR bookings at 1280, 768 and 360. The current graphite/lime design, responsive cards, RTL and drawer are preserved. Tall element captures include fixed-position page chrome artifacts; these captures hide header/Dock for inspection and do not substitute for interaction/overflow assertions.

## Files
Changed in this final continuation: tests/e2e/operations-demo.spec.ts — regression, full history, runtime monitoring, additional viewports and distinct booking/restored-branch assertions; unused capture parameter removed.
Added: this report and final verification logs/screenshots in .artifacts/operations-demo/.
Preserved from earlier work: tests/unit/operations-demo.test.ts, playwright.operations.config.ts, tests/fixtures/operations-server.mjs, and the two implementation fixes above. No production CMS, backend, schema, credentials or routing changes.

## Environment issues and remaining limitation
The public CMS hostname still returns DNS ENOTFOUND. Live CMS-backed case-study rendering remains unverified and previously returned 404. Isolated fixture success does not resolve that external dependency. A local Next development-server lock initially blocked the test server; the ordinary dev server was temporarily stopped for the isolated run and restarted afterward. A separate-directory experiment was reverted; production configuration is unchanged.

Logs: isolated-playwright.log, vitest.log, lint.log, typecheck.log, build.log. Backend-writing E2E suites were not executed. No deployment performed.
