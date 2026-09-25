import { defineConfig } from '@playwright/test';
// Diagnostics only: runs the remaining public specs against the production fixture server.
const root = process.cwd() + '/';
export default defineConfig({
  testDir: root + 'tests/e2e', workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: { command: 'node tests/fixtures/operations-server.mjs --production', cwd: root, url: 'http://127.0.0.1:3100/en', reuseExistingServer: false, timeout: 120000 },
  testMatch: ['about.spec.ts', 'case-study-demo.spec.ts', 'featured-localization.spec.ts', 'public.spec.ts', 'insights-public.spec.ts', 'connected-workflow.spec.ts', 'services-preview.spec.ts', 'services-recovery.spec.ts', 'editorial-ticker.spec.ts', 'typography.spec.ts', 'insights.spec.ts'],
});
