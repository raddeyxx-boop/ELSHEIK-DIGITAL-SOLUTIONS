// Main-thread cost of the live diagrams: long tasks while each demo autoplays, and
// timer/animation activity after they finish (should be none from the diagrams).
import { chromium } from '@playwright/test';
const base = process.argv[2] || 'http://localhost:3200';
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
for (const [route, selectors] of [['/en/process', ['section[aria-labelledby="process-model"]', 'section[aria-labelledby="process-loop"]']], ['/en/work', ['[data-testid="work-system-flow"]']], ['/en/work/relax-moon-spa-automation', ['#journey-stage-detail']], ['/en/about', ['[data-testid="about-flow"]']]]) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 900 } });
    await page.addInitScript(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); });
    await page.goto(base + route); await page.waitForTimeout(2000);
    const loadTasks = await page.evaluate(() => window.__lt.length);
    for (const s of selectors) { await page.locator(s).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(6500); }
    const during = await page.evaluate(n => window.__lt.slice(n), loadTasks);
    // After the demos: count DOM mutations inside the diagrams over 3 s (a finished demo should be still).
    const mutations = await page.evaluate(sels => new Promise(resolve => { let n = 0; const o = new MutationObserver(r => { n += r.length; }); for (const s of sels) { const el = document.querySelector(s); if (el) o.observe(el.closest('section') || el, { subtree: true, attributes: true, childList: true }); } setTimeout(() => { o.disconnect(); resolve(n); }, 3000); }), selectors);
    console.log(route.padEnd(38), width, 'long tasks during demos:', during.length ? during.join(',') + 'ms' : 'none', '| mutations after demos (3s):', mutations);
    await page.close();
  }
}
await browser.close();
