import { defineConfig } from '@playwright/test';
import production from './playwright.optimization.config';

export default defineConfig({
  ...production,
  testMatch: ['responsive-qa.spec.ts'],
  webServer: {
    ...production.webServer,
    command: 'node tests/fixtures/operations-server.mjs --production --responsive-content --port=3130 --cms-port=3131',
    url: 'http://127.0.0.1:3130/en',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
