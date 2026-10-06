// DevTools timeline for one navigation: time in style recalculation, layout, paint,
// script, parse, per event name. Usage: node nav-trace.mjs <base> <from> <to> [--mobile] [--cpu=4]
import { chromium } from '@playwright/test';
const [base = 'http://localhost:3200', from = '/en/about', to = '/en/process'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const mobile = process.argv.includes('--mobile');
const cpu = Number(process.argv.find(a => a.startsWith('--cpu='))?.split('=')[1] || 1);
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const css = process.argv.find(a => a.startsWith('--css='))?.slice(6);
if (css) await page.addInitScript(text => { const s = document.createElement('style'); s.textContent = text; document.documentElement.append(s); }, css);
await page.goto(base + from); await page.waitForTimeout(3000);
if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
const events = [];
cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
const ms = await page.evaluate(target => new Promise(resolve => {
  const before = document.querySelector('main h1')?.textContent, start = performance.now();
  const check = () => { const h = document.querySelector('main h1')?.textContent; if (location.pathname === target && h && h !== before) resolve(Math.round(performance.now() - start)); else requestAnimationFrame(check); };
  (document.querySelector(`header a[href="${target}"]`) || document.querySelector(`a[href="${target}"]`)).click(); requestAnimationFrame(check);
}), to);
await page.waitForTimeout(1500);
await cdp.send('Tracing.end'); await done;
const totals = new Map();
const main = events.filter(e => e.ph === 'X' && e.dur && ['UpdateLayoutTree', 'Layout', 'Paint', 'PrePaint', 'Layerize', 'FunctionCall', 'EvaluateScript', 'ParseHTML', 'ParseAuthorStyleSheet', 'RunTask', 'HitTest', 'UpdateLayer', 'Commit'].includes(e.name));
for (const e of main) totals.set(e.name, (totals.get(e.name) || 0) + e.dur / 1000);
const layouts = main.filter(e => e.name === 'Layout').map(e => Math.round(e.dur / 1000)).filter(x => x > 2);
const styles = main.filter(e => e.name === 'UpdateLayoutTree').map(e => ({ ms: Math.round(e.dur / 1000), n: e.args?.elementCount })).filter(x => x.ms > 2);
console.log(`${from} -> ${to}`, mobile ? `mobile cpu x${cpu}` : 'desktop', 'content', ms, 'ms');
for (const [k, v] of [...totals].sort((a, b) => b[1] - a[1])) console.log('  ', k.padEnd(22), Math.round(v), 'ms');
console.log('   layouts >2ms:', layouts.join(', '));
console.log('   style recalcs >2ms:', styles.map(s => `${s.ms}ms/${s.n ?? '?'} el`).join(', '));
console.log('   DOM elements on destination:', await page.evaluate(() => document.getElementsByTagName('*').length));
await browser.close();
