// Diagnostic only: throttles requestAnimationFrame delivery in the page to emulate a
// lower PixelBlast render cap, and measures draws/s and process CPU for each rate.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200', label = process.argv[3] || 'framerate-ab';
const results = [];
for (const fps of [0, 15, 12, 10]) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(cap => {
    window.__draws = 0; const d = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...a) { window.__draws++; return d.apply(this, a); };
    if (!cap) return;
    const raf = window.requestAnimationFrame.bind(window); let last = 0;
    window.requestAnimationFrame = cb => raf(function wait(now) { if (now - last >= 1000 / cap - 1) { last = now; cb(now); } else raf(wait); });
  }, fps);
  const bcdp = await browser.newBrowserCDPSession();
  const cpu = async type => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + '/en'); await page.waitForLoadState('load'); await page.waitForTimeout(2000);
  const [g0, r0, d0] = [await cpu('GPU'), await cpu('renderer'), await page.evaluate(() => window.__draws)];
  await page.waitForTimeout(8000);
  const [g1, r1, d1] = [await cpu('GPU'), await cpu('renderer'), await page.evaluate(() => window.__draws)];
  results.push({ cap: fps ? `${fps} fps` : 'current (30 fps cap)', drawsPerSecond: +((d1 - d0) / 8).toFixed(1), gpuProcessCpuPct: +((g1 - g0) / 8 * 100).toFixed(1), rendererCpuPct: +((r1 - r0) / 8 * 100).toFixed(1) });
  await browser.close();
}
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results);
