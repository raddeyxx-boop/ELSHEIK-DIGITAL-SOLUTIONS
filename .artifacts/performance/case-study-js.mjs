// Case-study JS attribution on the isolated fixture server (port 3100).
// Separates chunks referenced by the initial HTML from chunks loaded later.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const route = '/en/work/relax-moon-spa-automation';
const html = await (await fetch('http://127.0.0.1:3100' + route)).text();
const browser = await chromium.launch(); const results = [];
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => { window.audit = { lcp: 0, cls: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.audit.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.audit.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await page.goto('http://127.0.0.1:3100' + route); await page.waitForTimeout(2500);
  const data = await page.evaluate(() => ({ ...window.audit, demoTop: document.querySelector('#operations-demo')?.getBoundingClientRect().top, diagramTop: document.querySelector('[data-testid*="architecture"], [aria-label*="rchitecture"]')?.getBoundingClientRect().top,
    scripts: performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').map(r => ({ name: r.name.split('/').pop(), bytes: r.encodedBodySize, decoded: r.decodedBodySize, start: Math.round(r.startTime) })) }));
  data.scripts.forEach(s => { s.inInitialHtml = html.includes(s.name); });
  results.push({ route, width, viewportHeight: height, ...data, js: data.scripts.reduce((n, s) => n + s.bytes, 0), initialHtmlJs: data.scripts.filter(s => s.inInitialHtml).reduce((n, s) => n + s.bytes, 0) });
  await page.close();
}
await browser.close();
await fs.writeFile('.artifacts/performance/case-study-js.json', JSON.stringify(results, null, 2));
for (const r of results) { console.log(r.width, 'lcp', Math.round(r.lcp), 'cls', r.cls, 'js', r.js, 'initialHtmlJs', r.initialHtmlJs, 'demoTop', Math.round(r.demoTop), 'diagramTop', r.diagramTop && Math.round(r.diagramTop));
  r.scripts.sort((a, b) => b.bytes - a.bytes).slice(0, 12).forEach(s => console.log('   ', s.name.padEnd(24), String(s.bytes).padStart(7), s.inInitialHtml ? 'initial' : 'later', s.start)); }
