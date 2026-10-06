// Idle continuous cost per route (hardware GPU): as shipped vs every animation paused
// (diagnostic override). Also measured scrolled to the page middle, where heroes are offscreen.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200', label = process.argv[3] || 'route-idle';
const routes = (process.argv[4] || '/en,/en/work,/en/work/relax-moon-spa-automation,/en/services,/en/technologies,/en/about,/en/contact,/en/insights').split(',');
const pauseAll = () => { document.getAnimations().forEach(a => a.pause()); document.querySelectorAll('svg').forEach(s => s.pauseAnimations?.()); const s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation-play-state:paused!important}'; document.head.append(s); };
const results = [];
for (const route of routes) for (const [position, paused] of [['top', false], ['top', true], ['middle', false]]) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bcdp = await browser.newBrowserCDPSession();
  const cpu = async type => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + route); await page.waitForLoadState('load'); await page.waitForTimeout(1500);
  if (position === 'middle') { await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight / 2 - innerHeight / 2, behavior: 'instant' })); await page.waitForTimeout(1000); }
  if (paused) await page.evaluate(pauseAll);
  await page.waitForTimeout(1500);
  const [g0, r0] = [await cpu('GPU'), await cpu('renderer')]; await page.waitForTimeout(5000); const [g1, r1] = [await cpu('GPU'), await cpu('renderer')];
  results.push({ route, position, animations: paused ? 'all paused' : 'as shipped', gpuProcessCpuPct: +((g1 - g0) / 5 * 100).toFixed(1), rendererCpuPct: +((r1 - r0) / 5 * 100).toFixed(1),
    running: paused ? 0 : await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length) });
  await browser.close();
}
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results);
