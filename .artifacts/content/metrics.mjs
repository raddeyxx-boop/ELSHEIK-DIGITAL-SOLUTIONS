// Production lab metrics per route (same method as .artifacts/performance/measure.mjs):
// LCP, CLS, transferred JS and font bytes, console/network errors, overflow.
// Usage: node metrics.mjs <label> [base]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [label = 'run', base = 'http://localhost:3200'] = process.argv.slice(2);
const routes = ['/en', '/ar', '/en/work', '/ar/work', '/en/work/relax-moon-spa-automation', '/ar/work/relax-moon-spa-automation', '/en/services', '/ar/services', '/en/insights', '/ar/insights', '/en/technologies', '/ar/technologies', '/en/about', '/ar/about', '/en/contact', '/ar/contact', '/en/process', '/ar/process'];
const browser = await chromium.launch(); const results = [];
for (const route of routes) for (const [width, height] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('requestfailed', r => { if (r.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`${r.url()} ${r.failure()?.errorText}`); });
  await page.addInitScript(() => { window.audit = { lcp: 0, cls: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.audit.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.audit.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await page.goto(base + route); await page.waitForTimeout(2500);
  const d = await page.evaluate(() => { const r = performance.getEntriesByType('resource');
    return { ...window.audit, js: r.filter(x => x.initiatorType === 'script').reduce((n, x) => n + x.encodedBodySize, 0), fontBytes: r.filter(x => /\.woff2?$/.test(x.name)).reduce((n, x) => n + x.encodedBodySize, 0), fonts: r.filter(x => /\.woff2?$/.test(x.name)).length, overflow: document.documentElement.scrollWidth > innerWidth }; });
  results.push({ route, width, lcp: Math.round(d.lcp), cls: +d.cls.toFixed(4), js: d.js, fontBytes: d.fontBytes, fonts: d.fonts, overflow: d.overflow, errors: errors.length, errorSample: errors[0] || '' });
  await page.close();
}
await browser.close();
await fs.writeFile(`.artifacts/content/metrics-${label}.json`, JSON.stringify(results, null, 2));
console.table(results.map(r => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'errorSample'))));
