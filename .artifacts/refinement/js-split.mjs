// Page JS vs prefetched JS: scripts the document itself loads (script elements) vs
// script chunks fetched afterwards for other routes (viewport prefetch).
import { chromium } from '@playwright/test';
const base = process.argv[2] || 'http://localhost:3200';
const browser = await chromium.launch();
for (const route of ['/en', '/en/work', '/en/work/relax-moon-spa-automation', '/en/about', '/en/process', '/en/technologies', '/en/contact']) for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 900 } });
  await page.goto(base + route); await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const own = new Set([...document.querySelectorAll('script[src]')].map(s => s.src));
    const res = performance.getEntriesByType('resource').filter(x => x.initiatorType === 'script' || /\.js(\?|$)/.test(x.name));
    const sum = list => list.reduce((n, x) => n + x.encodedBodySize, 0);
    const page = res.filter(x => own.has(x.name)), other = res.filter(x => !own.has(x.name));
    return { page: sum(page), prefetched: sum(other), n: other.length };
  });
  console.log(route.padEnd(38), width, 'page JS', r.page, 'prefetched JS', r.prefetched, `(${r.n} chunks)`);
  await page.close();
}
await browser.close();
