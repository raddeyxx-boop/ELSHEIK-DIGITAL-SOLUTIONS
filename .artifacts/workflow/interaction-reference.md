# Workflow interaction reference and verification

Reference: user-supplied 078ffb07-42d1-469f-b240-ab68a8dec364.png.

Implemented in the homepage ConnectedWorkflow section:
- Seven centered icons: user, browser interface, API code, automation connections, backend database, PostgreSQL database, notification sender.
- Acid-lime outlined circles, dashed curved paths, two parallel signal branches, and a shared desktop notification path.
- A 760ms signal leg advances the shared workflow phase on actual animation completion. Nodes brighten and emit a 700ms expanding ring and strong halo on arrival, then retain a steady glow.
- Autoplay once on entering view; replay resets both branches, node states, pulses and the simulation checklist.
- Responsive SVG coordinates keep signals attached to their paths. Mobile uses a vertical branching diagram with all icons visible.
- EN/AR interface labels and direction-aware simulation controls.
- Reduced-motion preference is hydration-safe and responds to preference changes; no traveling or pulsing animations, with immediate completion on run.

Scope: no network actions or real automation are invoked.

Files changed:
- src/components/motion/connected-workflow.tsx (new)
- src/components/motion/connected-workflow.module.css (new)
- src/components/motion/system-experiences.tsx (re-exports the dedicated workflow)
- tests/e2e/connected-workflow.spec.ts (new)

Verification: lint, typecheck, production build passed; 18 unit/integration tests passed; four focused EN/AR desktop/mobile workflow tests and two existing homepage responsive tests passed. Focused coverage checks seven visible icons, arrival-triggered pulses, final notification, replay reset, no horizontal overflow, and reduced-motion operation.

Screenshots at 1440×900 and 390×900 viewports:
- en-1440.png / en-1440-arrival.png
- ar-1440.png / ar-1440-arrival.png
- en-390.png / en-390-arrival.png
- ar-390.png / ar-390-arrival.png
