// Diagnostic only: temporarily disables one CSS effect category at a time (injected
// style, never shipped) and measures continuous cost with PixelBlast animating.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200', route = process.argv[3] || '/en', label = process.argv[4] || 'effects-ab';
const variants = {
  'baseline (all effects)': '',
  'header backdrop-filter off': 'header, header * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
  'hero mask-image off': '[data-hero-pixels] { mask-image: none !important; -webkit-mask-image: none !important; }',
  'both off': 'header, header * { backdrop-filter: none !important; } [data-hero-pixels] { mask-image: none !important; }',
  'PixelBlast paused (canvas hidden)': '[data-hero-pixels] canvas { visibility: hidden !important; }',
};
const results = [];
for (const [name, css] of Object.entries(variants)) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
  const bcdp = await browser.newBrowserCDPSession();
  const procs = async () => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo;
  const sum = (list, type) => list.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + route); await page.waitForLoadState('load');
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(2500);
  const [p0, m0] = [await procs(), await cdp.send('Performance.getMetrics')];
  await page.waitForTimeout(6000);
  const [p1, m1] = [await procs(), await cdp.send('Performance.getMetrics')];
  const task = m => m.metrics.find(x => x.name === 'TaskDuration').value;
  results.push({ route, variant: name, gpuProcessCpuPct: +((sum(p1, 'GPU') - sum(p0, 'GPU')) / 6 * 100).toFixed(1), rendererCpuPct: +((sum(p1, 'renderer') - sum(p0, 'renderer')) / 6 * 100).toFixed(1), mainThreadPct: +((task(m1) - task(m0)) / 6 * 100).toFixed(1),
    state: await page.evaluate(() => document.querySelector('[data-hero-pixels] [data-state]')?.getAttribute('data-state') || 'n/a') });
  await browser.close();
}
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results);
