// Records every layout shift with its source elements and time, plus font load times.
// Usage: node cls-sources.mjs <path> [width] [runs]
import { chromium } from '@playwright/test';
const [path = '/ar/about', width = '390', runs = '3'] = process.argv.slice(2);
const browser = await chromium.launch();
for (let run = 0; run < Number(runs); run++) {
  const page = await browser.newPage({ viewport: { width: Number(width), height: 844 } });
  await page.addInitScript(() => {
    window.__shifts = [];
    const describe = n => { if (!n || !n.tagName) return String(n?.nodeName || '?'); const c = (n.getAttribute('class') || '').split(' ').filter(Boolean).map(x => x.split('__').pop()).join('.'); return n.tagName.toLowerCase() + (c ? '.' + c : '') + ' "' + (n.textContent || '').trim().slice(0, 24) + '"'; };
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: e.sources.map(s => describe(s.node) + ` dy=${Math.round(s.currentRect.y - s.previousRect.y)} dh=${Math.round(s.currentRect.height - s.previousRect.height)}`) }); }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('http://localhost:3200' + path); await page.waitForTimeout(3000);
  const data = await page.evaluate(() => ({ shifts: window.__shifts, fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime), fonts: performance.getEntriesByType('resource').filter(r => /woff2/.test(r.name)).map(r => `${r.name.split('/').pop().slice(0, 10)} start=${Math.round(r.startTime)} end=${Math.round(r.responseEnd)}`) }));
  console.log(`run ${run} fcp=${data.fcp} fonts: ${data.fonts.join(' | ')}`);
  for (const s of data.shifts) console.log(`   t=${s.t} v=${s.v} ${s.src.join(' ; ')}`);
  await page.close();
}
await browser.close();
