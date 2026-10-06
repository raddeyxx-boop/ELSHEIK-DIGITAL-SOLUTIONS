// Local production diagnostic: fresh contexts, no mutations or external submissions.
import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const browser = await chromium.launch(
  process.argv.includes("--gpu")
    ? {
        args: [
          "--enable-gpu",
          "--ignore-gpu-blocklist",
          ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []),
        ],
      }
    : {},
);
const results = [];
for (const width of [1440, 390]) {
  for (const route of ["/en", "/en/services", "/en/process"]) {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const scripts = new Set();
      let errors = 0;
      page.on("pageerror", () => errors++);
      page.on("response", (response) => {
        const url = new URL(response.url());
        if (
          url.pathname.startsWith("/_next/static/") &&
          url.pathname.endsWith(".js")
        )
          scripts.add(url.pathname);
      });
      await page.addInitScript(() => {
        window.__perf = { lcp: 0, cls: 0, longTasks: 0 };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) window.__perf.lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            if (!e.hadRecentInput) window.__perf.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            window.__perf.longTasks += Math.max(0, e.duration - 50);
        }).observe({ type: "longtask", buffered: true });
      });
      await page.goto(`http://127.0.0.1:3120${route}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1500);
      const metrics = await page.evaluate(() => ({
        ...window.__perf,
        fcp: performance.getEntriesByName("first-contentful-paint")[0]
          ?.startTime,
        ttfb: performance.getEntriesByType("navigation")[0].responseStart,
      }));
      let jsBytes = 0,
        jsGzip = 0;
      for (const path of scripts) {
        const bytes = await readFile(`.next${path.replace("/_next", "")}`);
        jsBytes += bytes.length;
        jsGzip += gzipSync(bytes).length;
      }
      results.push({ width, route, run, ...metrics, jsBytes, jsGzip, errors });
      await context.close();
    }
  }
}
await browser.close();
await mkdir(".artifacts/performance", { recursive: true });
await writeFile(
  `.artifacts/performance/${process.argv[2] || "measurement"}.json`,
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results));
