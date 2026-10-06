// Diagnostic only: isolates continuous-cost sources on a route with injected, never-shipped overrides.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200', route = process.argv[3] || '/en', label = process.argv[4] || 'isolate-ab';
const noWebgl = () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; };
const variants = [
  ['baseline', null, ''],
  ['ticker paused', null, '[class*=tickerTrack]{animation-play-state:paused!important}'],
  ['WebGL unavailable (PixelBlast fallback)', noWebgl, ''],
  ['ticker paused + WebGL unavailable', noWebgl, '[class*=tickerTrack]{animation-play-state:paused!important}'],
  ['all CSS animations paused', null, '*,*::before,*::after{animation-play-state:paused!important}'],
];
const results = [];
for (const [name, init, css] of variants) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (init) await page.addInitScript(init);
  const bcdp = await browser.newBrowserCDPSession();
  const cpu = async type => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + route); await page.waitForLoadState('load'); if (css) await page.addStyleTag({ content: css }); await page.waitForTimeout(2500);
  const [g0, r0] = [await cpu('GPU'), await cpu('renderer')]; await page.waitForTimeout(8000); const [g1, r1] = [await cpu('GPU'), await cpu('renderer')];
  const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.constructor.name));
  results.push({ route, variant: name, gpuProcessCpuPct: +((g1 - g0) / 8 * 100).toFixed(1), rendererCpuPct: +((r1 - r0) / 8 * 100).toFixed(1), runningAnimations: running.length });
  await browser.close();
}
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results);
