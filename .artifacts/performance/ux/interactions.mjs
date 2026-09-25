// CPU-profiles realistic interactions (hardware GPU) and attributes JS self time to files.
// Usage: node interactions.mjs <base> <label> [--cpu=4]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base = 'http://localhost:3200', label = 'interactions'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const cpu = Number(process.argv.find(a => a.startsWith('--cpu='))?.split('=')[1] || 1);
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const results = [];
async function scenario(name, viewport, path, act, { profileLoad = false } = {}) {
  const page = await browser.newPage({ viewport, ...(viewport.width < 500 ? { isMobile: true, hasTouch: true } : {}) });
  const cdp = await page.context().newCDPSession(page);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.addInitScript(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); });
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  if (profileLoad) await cdp.send('Profiler.start');
  await page.goto(base + path); await page.waitForLoadState(profileLoad ? 'domcontentloaded' : 'load');
  if (!profileLoad) { await page.waitForTimeout(1500); await page.evaluate(() => { window.__lt = []; }); await cdp.send('Profiler.start'); }
  const started = Date.now(); await act(page); const wall = Date.now() - started;
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map(); profile.samples.forEach((id, i) => self.set(id, (self.get(id) || 0) + profile.timeDeltas[i] / 1000));
  const byFile = new Map(); let js = 0, gc = 0;
  for (const n of profile.nodes) { const ms = self.get(n.id) || 0, f = n.callFrame; if (!ms || ['(idle)', '(program)'].includes(f.functionName)) continue;
    if (f.functionName === '(garbage collector)') { gc += ms; continue; }
    js += ms; const file = f.url ? f.url.split('/').pop().split('?')[0] : `native:${f.functionName}`; byFile.set(file, (byFile.get(file) || 0) + ms); }
  const lt = await page.evaluate(() => window.__lt);
  results.push({ scenario: name, wallMs: wall, jsMs: Math.round(js), gcMs: Math.round(gc), longTasks: lt.length, longTaskMs: lt.reduce((a, b) => a + b, 0), maxLongTask: Math.max(0, ...lt),
    topFiles: [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v.toFixed(0)}ms`).join(' | ') });
  await page.close();
}
const desktop = { width: 1440, height: 900 }, mobile = { width: 390, height: 844 };
await scenario('Home: wheel-scroll down and up', desktop, '/en', async p => { await p.mouse.move(700, 450); for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 600); await p.waitForTimeout(250); } for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, -600); await p.waitForTimeout(250); } });
await scenario('Home: pointer moving over hero 3s', desktop, '/en', async p => { for (let i = 0; i < 60; i++) { await p.mouse.move(100 + (i * 23) % 1200, 200 + (i * 37) % 500); await p.waitForTimeout(50); } });
await scenario('Mobile menu open/close x3', mobile, '/en', async p => { for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: /open menu/i }).click(); await p.locator('#mobile-nav').waitFor(); await p.getByRole('button', { name: /close menu/i }).click(); await p.waitForTimeout(300); } });
await scenario('Case study hard load (hydration)', desktop, '/en/work/relax-moon-spa-automation', async p => { await p.getByTestId('operations-console').waitFor(); await p.waitForTimeout(1500); }, { profileLoad: true });
await scenario('Case study: demo tabs x6 + booking dialog', desktop, '/en/work/relax-moon-spa-automation', async p => {
  const demo = p.getByTestId('operations-console'); await demo.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  for (const name of ['Bookings', 'Team', 'Customers', 'Activity', 'Analytics', 'Overview']) { await demo.getByRole('tab', { name, exact: true }).click(); await p.waitForTimeout(200); }
  await demo.getByRole('tab', { name: 'Bookings', exact: true }).click(); await demo.getByRole('button', { name: /DEMO-RM-009/ }).click(); await p.getByRole('dialog').waitFor(); await p.keyboard.press('Escape'); await p.waitForTimeout(300); });
await scenario('Case study: wheel-scroll through page', desktop, '/en/work/relax-moon-spa-automation', async p => { await p.mouse.move(700, 450); for (let i = 0; i < 16; i++) { await p.mouse.wheel(0, 700); await p.waitForTimeout(250); } });
await browser.close();
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results.map(r => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'topFiles')))); for (const r of results) console.log(r.scenario, '=>', r.topFiles);
