import { defineConfig } from "@playwright/test";

// Safe production regression checks against the existing read-only CMS fixture.
export default defineConfig({
  metadata: { publicCms: "dictionary-fallback" },
  testDir: "./tests/e2e",
  testMatch: [
    "responsive-qa.spec.ts",
    "header-navigation.spec.ts",
    "services-preview.spec.ts",
    "services-recovery.spec.ts",
    "process.spec.ts",
    "live-systems.spec.ts",
    "connected-workflow.spec.ts",
    "operations-demo.spec.ts",
    "insights-public.spec.ts",
    "pixel-background.spec.ts",
    "optimization.spec.ts",
    "service-hover.spec.ts",
    "performance-navigation.spec.ts",
    "technologies.spec.ts",
    "case-study-demo.spec.ts",
  ],
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3130",
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--enable-gpu",
        "--ignore-gpu-blocklist",
        ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []),
      ],
    },
  },
  webServer: {
    command:
      "node tests/fixtures/operations-server.mjs --production --port=3130 --cms-port=3131",
    url: "http://127.0.0.1:3130/en",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
