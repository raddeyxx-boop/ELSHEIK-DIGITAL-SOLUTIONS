import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',testMatch:'operations-demo.spec.ts',workers:1,
  use:{baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure'},
  webServer:{command:'node tests/fixtures/operations-server.mjs',url:'http://127.0.0.1:3100/en',reuseExistingServer:false,timeout:120000},
});
