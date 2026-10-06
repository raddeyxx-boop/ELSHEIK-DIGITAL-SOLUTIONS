import { expect, test } from "@playwright/test";
import { labels } from "../../src/components/case-study/operations-demo/labels";
import { statesFor } from "../../src/content/system-states";

for (const locale of ["en", "ar"]) for (const width of [1440, 390]) {
  test(`${locale} ${width}: initial route resources`, async ({ browser, baseURL }, testInfo) => {
    test.setTimeout(120000);
    const results = [];
    for (const route of ["", "/about", "/services", "/technologies", "/work", "/insights", "/contact", "/work/relax-moon-spa-automation"]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await context.newPage();
      await page.addInitScript(() => {
        const metrics = { lcp: 0, cls: 0, longTasks: 0 };
        Object.assign(window, { navigationMetrics: metrics });
        new PerformanceObserver(list => { for (const e of list.getEntries()) metrics.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!(e as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) metrics.cls += (e as PerformanceEntry & { value: number }).value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => { metrics.longTasks += list.getEntries().filter(e => e.duration > 50).length; }).observe({ type: "longtask", buffered: true });
      });
      await page.goto(`${baseURL}/${locale}${route}`);
      await expect(page.locator("main h1").first()).toBeVisible();
      await page.waitForTimeout(1000);
      results.push(await page.evaluate(() => ({
        route: location.pathname,
        ...((window as unknown as { navigationMetrics: object }).navigationMetrics),
        loadMs: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).loadEventEnd,
        resources: performance.getEntriesByType("resource").filter(e => e.name.includes("/_next/") && e.name.endsWith(".js")).map(e => ({ name: new URL(e.name).pathname, bytes: (e as PerformanceResourceTiming).decodedBodySize, wireBytes: (e as PerformanceResourceTiming).transferSize })),
      })));
      await context.close();
    }
    await testInfo.attach("initial-performance", { body: JSON.stringify({ locale, width, results }, null, 2), contentType: "application/json" });
  });
}

for (const locale of ["en", "ar"] as const) {
  for (const width of [1440, 768, 390, 430]) {
    test(`${locale} ${width}: production route and tab timings`, async ({ page }, testInfo) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      await page.addInitScript(() => {
        const metrics = { lcp: 0, cls: 0, longTasks: 0 };
        Object.assign(window, { navigationMetrics: metrics });
        new PerformanceObserver(list => { for (const e of list.getEntries()) metrics.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!(e as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) metrics.cls += (e as PerformanceEntry & { value: number }).value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => { metrics.longTasks += list.getEntries().filter(e => e.duration > 50).length; }).observe({ type: "longtask", buffered: true });
      });
      const start = Date.now();
      await page.goto(`/${locale}`);
      await expect(page.locator("main h1").first()).toBeVisible();
      await page.waitForTimeout(1000);
      const initial = await page.evaluate(() => ({
        ...((window as unknown as { navigationMetrics: object }).navigationMetrics),
        resources: performance.getEntriesByType("resource").filter(e => e.name.includes("/_next/") && e.name.endsWith(".js")).map(e => ({ name: new URL(e.name).pathname, bytes: (e as PerformanceResourceTiming).decodedBodySize, wireBytes: (e as PerformanceResourceTiming).transferSize })),
      }));
      const initialLoadMs = Date.now() - start - 1000;
      await page.evaluate(() => Object.assign(window, { documentMarker: "retained", sharedHeader: document.querySelector("body > header") }));
      const timings: { from: string; to: string; ms: number }[] = [];
      async function navigate(path: string) {
        const destination = `/${locale}${path}`;
        const link = page.locator(`a[href="${destination}"]`).filter({ visible: true }).first();
        await link.scrollIntoViewIfNeeded();
        // Measure likely-next navigation after normal viewport prefetch has had time.
        await page.waitForTimeout(500);
        const from = new URL(page.url()).pathname;
        const before = Date.now();
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${destination}$`));
        await expect(page.locator("main h1").first()).toBeVisible();
        await expect(page.getByLabel(statesFor(locale).loading, { exact: true })).toHaveCount(0);
        timings.push({ from, to: destination, ms: Date.now() - before });
        expect(await page.evaluate(() => {
          const w = window as unknown as { documentMarker: string; sharedHeader: Element };
          return w.documentMarker === "retained" && w.sharedHeader === document.querySelector("body > header");
        })).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      }
      for (const route of ["/services", "/technologies", "/work", "/work/relax-moon-spa-automation"]) await navigate(route);
      const demo = page.getByTestId("operations-console");
      await demo.scrollIntoViewIfNeeded();
      const consoleNode = await demo.elementHandle();
      const l = labels(locale);
      const requests: string[] = [];
      const onRequest = (request: import("@playwright/test").Request) => requests.push(request.url());
      await page.waitForTimeout(500);
      page.on("request", onRequest);
      const tabTimings: { tab: string; ms: number; clickToPaintMs: number }[] = [];
      for (const tab of ["bookings", "team", "customers", "activity", "analytics"] as const) {
        const button = demo.getByRole("tab", { name: l[tab], exact: true });
        await button.evaluate(el => {
          el.addEventListener("click", () => {
            const start = performance.now();
            Object.assign(window, { tabPaint: new Promise<number>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - start)))) });
          }, { once: true, capture: true });
        });
        const before = Date.now();
        await button.click();
        await expect(button).toHaveAttribute("aria-selected", "true");
        await expect(demo.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", `operations-tab-${tab}`);
        const ms = Date.now() - before;
        const clickToPaintMs = await page.evaluate(() => (window as unknown as { tabPaint: Promise<number> }).tabPaint);
        tabTimings.push({ tab, ms, clickToPaintMs });
      }
      page.off("request", onRequest);
      expect(requests).toEqual([]);
      expect(await consoleNode?.evaluate(el => el.isConnected && el === document.querySelector('[data-testid="operations-console"]'))).toBe(true);
      await navigate("/work");
      for (const route of ["/insights", "/about", "/contact", ""]) await navigate(route);
      const otherLocale = locale === "en" ? "ar" : "en";
      if (width < 1024) await page.locator('body > header button[aria-controls="mobile-nav"]').click();
      await page.locator(`body > header a[href="/${otherLocale}"]`).filter({ visible: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${otherLocale}$`));
      await expect(page.locator("html")).toHaveAttribute("dir", otherLocale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("main h1").first()).toBeVisible();
      expect(errors).toEqual([]);
      await testInfo.attach("navigation-performance", { body: JSON.stringify({ locale, width, initialLoadMs, initial, timings, tabTimings, errors }, null, 2), contentType: "application/json" });
    });
  }
}
