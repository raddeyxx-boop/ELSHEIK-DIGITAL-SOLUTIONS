import { defineConfig } from '@playwright/test';
import operations from './playwright.operations.config';
// The decorative WebGL heroes refuse software-only WebGL (headless Chromium's
// default), so the browser runs on the machine's GPU as a visitor's would.
const gpu = ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])];
export default defineConfig({
  ...operations,
  use: { ...operations.use, launchOptions: { args: gpu } },
  webServer: [
    { ...operations.webServer, command: 'node tests/fixtures/operations-server.mjs --production', url: 'http://127.0.0.1:3100/en', reuseExistingServer: false },
    { command: 'node tests/fixtures/operations-server.mjs --production --cms-unreachable', url: 'http://127.0.0.1:3110/en/about', reuseExistingServer: false, timeout: 120000 },
  ],
  testMatch: ['operations-demo.spec.ts', 'pixel-background.spec.ts', 'cms-outage.spec.ts', 'locale-typography.spec.ts', 'header-navigation.spec.ts', 'process.spec.ts', 'live-systems.spec.ts'],
});
