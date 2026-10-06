# Lime editorial ticker — acceptance report

Only “DESIGN × ENGINEERING × OPERATIONS” is animated. The existing paragraph, star, colors, spacing, font styling and section layout are preserved.

## Motion

- Desktop above 900px: the original vertical lane remains in place; text travels upward continuously.
- Tablet/mobile at 900px and below: the old label was hidden. The ticker is now visible in the existing empty space above the paragraph, beside the star on mobile; it travels right to left. No paragraph, star or section geometry changes were needed.
- English brand descriptor remains unchanged in both locales, including the × characters. Direction does not reverse for Arabic.
- Duration: 24 seconds, linear, infinite. Four identical visual repeats move by exactly one repeat length (25% of their combined track). Extra copies fill the lane through the loop boundary, including at the widest horizontal breakpoint.
- Only translate3d transforms animate. No React motion state, animation library, runtime measurements, per-frame JS or hover pause.
- Reduced motion: no animation; one complete static phrase is displayed. It wraps naturally on narrow screens so no words are lost.
- One semantic phrase is available to screen readers. The visual repetitions are aria-hidden.

## Acceptance

| Check | Result |
| --- | --- |
| MOVING TICKER | PASS |
| SEAMLESS LOOP | PASS |
| PREMIUM MOTION | PASS |
| READABLE SPEED | PASS |
| DESIGN UNCHANGED | PASS — fixed geometry, with requested mobile ticker made visible in unused space |
| DESKTOP | PASS |
| TABLET | PASS |
| MOBILE | PASS |
| ARABIC/RTL | PASS |
| REDUCED MOTION | PASS |
| NO OVERFLOW | PASS |
| ACCESSIBILITY | PASS — single semantic copy, hidden duplicates, static reduced-motion text |
| LINT | PASS |
| TYPECHECK | PASS |
| BUILD | PASS |

## Evidence

Before/after measurements confirm identical section dimensions, paragraph bounds and star bounds for English and Arabic at 1920, 1600, 1440, 1280, 1024, 768, 430, 390, 375 and 320px. See [comparison.json](comparison.json).

Focused browser tests additionally cover 900px. They verify motion direction, linear 24-second timing, no hover pause, no paragraph/star overlap, no horizontal overflow, unchanged geometry when reduced motion is toggled, full static-text visibility, and one screen-reader phrase.

Loop-boundary screenshots at animation times 0 and 24,000ms are pixel-identical. Live desktop-English and mobile-Arabic sessions were also monitored for two full actual animation loops, with periodic screenshots and animationiteration event counts.

Verification:
- npm run lint: PASS
- npm run typecheck: PASS
- npm test: 18 tests PASS
- npm run build: PASS
- New ticker Playwright coverage: 3 / 3 PASS
- Existing Playwright coverage: 23 / 23 PASS

## Exact application/test files modified

1. src/components/sections/homepage.tsx — wraps only the existing phrase with its visual track.
2. src/components/sections/homepage.module.css — scoped ticker animation and responsive/reduced-motion rules.
3. tests/e2e/editorial-ticker.spec.ts — focused verification and two-loop observation.

No other application sections or backend implementation files were edited.

## Screenshots and QA artifacts

- [English desktop](after-en-1440.png)
- [Arabic desktop](after-ar-1440.png)
- [English mobile](after-en-390.png)
- [Arabic mobile](after-ar-390.png)
- [English reduced motion](reduced-en-390.png)
- [Arabic reduced motion](reduced-ar-390.png)

Additional screenshots cover 1920, 1024, 768 and 320px in both languages; before screenshots cover 1440, 390 and 320px. Four live-loop frames per observed locale/viewport are named loop-en-desktop-1.png through -4.png and loop-ar-mobile-1.png through -4.png.

QA-only files in .artifacts/ticker: baseline.mjs, verify.mjs, before.json, comparison.json, this report, screenshots and Playwright result directories. These are not public site content.
