// CPU profile of header navigations: where main-thread time goes between the click
// and the destination content. Aggregates self time by function + script and lists
// long tasks per navigation. Usage: node nav-profile.mjs <base> <label> [--gpu] [--mobile] [--cpu=4]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base = 'http://localhost:3200', label = 'run'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const gpu = process.argv.includes('--gpu'), mobile = process.argv.includes('--mobile');
const cpu = Number(process.argv.find(a => a.startsWith('--cpu='))?.split('=')[1] || 1);
const browser = await chromium.launch(gpu ? { args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] } : {});
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
if (process.argv.includes('--cv')) await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = 'main section ~ section { content-visibility: auto; contain-intrinsic-size: auto 900px; }'; document.documentElement.append(s); });
await page.addInitScript(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({ t: Math.round(e.startTime), ms: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true }); });
await page.goto(base + '/en'); await page.waitForTimeout(2500);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
const routes = ['/en/services', '/en/work', '/en/process', '/en/about', '/en/insights', '/en/contact', '/en'];
const navs = [];
await cdp.send('Profiler.start');
for (const href of routes) {
  const ltBefore = await page.evaluate(() => window.__lt.length);
  const ms = await page.evaluate(target => new Promise(resolve => {
    const before = document.querySelector('main h1')?.textContent, start = performance.now();
    const check = () => { const h = document.querySelector('main h1')?.textContent; if (location.pathname === target && h && h !== before) resolve(Math.round(performance.now() - start)); else requestAnimationFrame(check); };
    const link = document.querySelector(`header nav a[href="${target}"]`) || document.querySelector(`#mobile-nav a[href="${target}"]`) || document.querySelector(`a[href="${target}"]`);
    link.click(); requestAnimationFrame(check);
  }), href);
  await page.waitForTimeout(1200);
  const lt = await page.evaluate(n => window.__lt.slice(n), ltBefore);
  navs.push({ href, contentMs: ms, longTasks: lt.map(x => x.ms) });
}
const { profile } = await cdp.send('Profiler.stop');
const byId = new Map(profile.nodes.map(n => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas; let i = 0;
for (const id of profile.samples) { const n = byId.get(id); const f = n.callFrame; const key = `${f.functionName || '(anon)'} @ ${(f.url.split('/').pop() || f.url || '(native)').slice(0, 40)}`; self.set(key, (self.get(key) || 0) + (dt[i++] || 0) / 1000); }
const top = [...self].filter(([k]) => !/^\(idle\)|^\(program\)|^\(garbage/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 25);
const byScript = new Map();
for (const [k, v] of self) { const s = k.split(' @ ')[1]; byScript.set(s, (byScript.get(s) || 0) + v); }
const result = { label, gpu, mobile, cpu, navs, topSelfMs: top.map(([k, v]) => [k, Math.round(v)]), byScriptMs: [...byScript].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => [k, Math.round(v)]) };
await fs.writeFile(`.artifacts/zero-refresh/profile-${label}.json`, JSON.stringify(result, null, 2));
await fs.writeFile(`.artifacts/zero-refresh/profile-${label}.cpuprofile`, JSON.stringify(profile));
for (const n of navs) console.log(n.href.padEnd(14), 'content', n.contentMs, 'ms  long tasks', n.longTasks.join(',') || '-');
console.log('top self time (ms):'); for (const [k, v] of result.topSelfMs.slice(0, 14)) console.log('  ', String(v).padStart(6), k);
console.log('by script (ms):'); for (const [k, v] of result.byScriptMs.slice(0, 10)) console.log('  ', String(v).padStart(6), k);
await browser.close();
