// CPU-profiles one client navigation and attributes self time to source files/functions.
// Usage: node profile-nav.mjs <base> <fromPath> <linkSelector> <label> [--cpu=4] [--swiftshader]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base, from, selector, label] = process.argv.slice(2);
const cpu = Number(process.argv.find(a => a.startsWith('--cpu='))?.split('=')[1] || 1);
const browser = await chromium.launch(process.argv.includes('--swiftshader') ? {} : { args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await page.goto(base + from); await page.waitForLoadState('load'); await page.waitForTimeout(2500);
if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await page.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask' }); });
await cdp.send('Profiler.start');
await page.locator(selector).first().click();
await page.waitForTimeout(3000);
const { profile } = await cdp.send('Profiler.stop');
const longTasks = await page.evaluate(() => window.__lt);
await fs.writeFile(`.artifacts/performance/ux/profile-${label}.cpuprofile`, JSON.stringify(profile));
// Self time per node from samples.
const dt = new Map(); profile.samples.forEach((id, i) => dt.set(id, (dt.get(id) || 0) + (profile.timeDeltas[i] || 0) / 1000));
const byFn = new Map(), byFile = new Map(); let total = 0;
for (const n of profile.nodes) {
  const ms = dt.get(n.id) || 0; if (!ms) continue; const f = n.callFrame;
  if (['(idle)', '(program)'].includes(f.functionName)) continue; total += ms;
  const file = f.url ? f.url.split('/').pop() : `(${f.functionName || 'native'})`;
  byFile.set(file, (byFile.get(file) || 0) + ms);
  const key = `${f.functionName || '(anonymous)'} @ ${file}:${f.lineNumber}`; byFn.set(key, (byFn.get(key) || 0) + ms);
}
const top = m => [...m].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${v.toFixed(1).padStart(7)}ms  ${k}`);
console.log(`${label}: busy ${total.toFixed(0)}ms in 3s window, long tasks ${JSON.stringify(longTasks)}`);
console.log(' by file:\n  ' + top(byFile).join('\n  '));
console.log(' by function:\n  ' + top(byFn).join('\n  '));
await browser.close();
