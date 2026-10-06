// Real-navigation journey: Home -> Work -> case study -> back -> Contact -> Home.
// Measures, per click (page clock, ms after the click event):
//   response  first DOM mutation after the click (any visible reaction)
//   url       location.pathname reaches the destination
//   heading   destination <h1> (or the 404 heading) is in the DOM
//   complete  no route loading placeholder remains
// Usage: node journey.mjs <baseUrl> <label> [--mobile] [--cpu=4] [--net=slow4g] [--gpu]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base = 'http://localhost:3200', label = 'run'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flag = name => process.argv.find(a => a.startsWith(`--${name}`));
const mobile = !!flag('mobile'), cpu = Number(flag('cpu')?.split('=')[1] || 1), net = flag('net')?.split('=')[1];
const browser = await chromium.launch(flag('gpu') ? { args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] } : {});
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
if (net === 'slow4g') { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); }
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('requestfinished', async r => { const s = await r.sizes().catch(() => ({})); const h = r.headers(); requests.push({ t: Date.now(), url: r.url().replace(base, ''), kind: h.rsc === '1' ? (h['next-router-prefetch'] ? 'rsc-prefetch' : 'rsc') : r.resourceType(), bytes: s.responseBodySize || 0, ms: Math.round(r.timing().responseEnd) }); });
await page.addInitScript(() => {
  window.__lt = [];
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({ start: Math.round(e.startTime), ms: Math.round(e.duration), src: e.attribution?.[0]?.containerSrc || '' }); }).observe({ type: 'longtask', buffered: true });
  window.__arm = (target) => {
    const heading = () => { const h = document.querySelector('main h1'); return h ? h.textContent.trim() : ''; };
    const previous = heading(), s = { target, previous }; window.__step = s;
    addEventListener('click', () => { s.click = performance.now(); }, { capture: true, once: true });
    new MutationObserver((_, o) => { if (s.click && !s.response) { s.response = performance.now(); } if (s.response) o.disconnect(); }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    const tick = () => {
      const now = performance.now();
      if (s.click || s.popstate) {
        const t0 = s.click || s.popstate;
        if (!s.url && location.pathname === target) s.url = now - t0;
        const h = heading(), notFound = /outside the system|404/i.test(document.body.innerText.slice(0, 4000));
        if (!s.heading && s.url && ((h && h !== previous) || notFound)) { s.heading = now - t0; s.headingText = h.slice(0, 60); s.notFound = notFound; }
        if (s.heading && !s.complete && !document.querySelector('[aria-label="Loading content"]')) { s.complete = now - t0; s.notFound = /outside the system|404/i.test(document.body.innerText.slice(0, 4000)); }
        if (s.response && s.response < 1e9 && !s.responseRel) s.responseRel = s.response - t0;
        if (s.complete || now - t0 > 30000) { s.done = true; return; }
      }
      requestAnimationFrame(tick);
    };
    addEventListener('popstate', () => { s.popstate = performance.now(); }, { once: true });
    requestAnimationFrame(tick);
  };
});
const steps = [];
async function step(name, target, act) {
  await page.evaluate(t => window.__arm(t), target);
  const wall = Date.now(), ltBefore = await page.evaluate(() => window.__lt.length);
  await act();
  await page.waitForFunction(() => window.__step.done, null, { timeout: 45000 }).catch(() => {});
  const s = await page.evaluate(() => window.__step);
  const lt = await page.evaluate(n => window.__lt.slice(n), ltBefore);
  const r = requests.filter(x => x.t >= wall);
  steps.push({ name, target, responseMs: s.responseRel && Math.round(s.responseRel), urlMs: s.url && Math.round(s.url), headingMs: s.heading && Math.round(s.heading), completeMs: s.complete && Math.round(s.complete), heading: s.headingText, notFound: s.notFound,
    longTasks: lt.length, longTaskMs: lt.reduce((n, x) => n + x.ms, 0), maxLongTask: Math.max(0, ...lt.map(x => x.ms)),
    rsc: r.filter(x => x.kind === 'rsc').map(x => `${x.url.split('?')[0]} ${x.ms}ms`), scripts: r.filter(x => x.kind === 'script').length, scriptBytes: r.filter(x => x.kind === 'script').reduce((n, x) => n + x.bytes, 0) });
  await page.waitForTimeout(1500);
}
const idle = async (name, ms) => { const wall = Date.now(); await page.waitForTimeout(ms); const r = requests.filter(x => x.t >= wall); steps.push({ name, idleMs: ms, prefetchRsc: r.filter(x => x.kind === 'rsc-prefetch').map(x => x.url.split('?')[0]), scripts: r.filter(x => x.kind === 'script').length, bytes: r.reduce((n, x) => n + x.bytes, 0) }); };
const nav = href => mobile
  ? async () => { await page.getByRole('button', { name: /menu|القائمة/i }).first().click(); await page.locator(`#mobile-nav a[href="${href}"]`).first().click(); }
  : async () => { await page.locator(`header nav a[href="${href}"]`).first().click(); };
const t0 = Date.now();
await page.goto(base + '/en', { waitUntil: 'commit' });
await page.locator('main h1').waitFor();
const homeHero = Date.now() - t0;
await page.waitForLoadState('load'); const homeLoad = Date.now() - t0;
await idle('idle on Home', 4000);
await step('Home -> Work', '/en/work', nav('/en/work'));
await idle('idle on Work', 2000);
await step('Work -> case study', '/en/work/relax-moon-spa-automation', async () => { await page.locator('main a[href="/en/work/relax-moon-spa-automation"]').first().click(); });
await step('back -> Work', '/en/work', async () => { await page.goBack(); });
await step('Work -> Contact', '/en/contact', nav('/en/contact'));
await step('Contact -> Home', '/en', nav('/en'));
const result = { label, base, mobile, cpu, net: net || 'none', homeHeroMs: homeHero, homeLoadMs: homeLoad, steps, errors: [...new Set(errors)].slice(0, 10) };
await fs.writeFile(`.artifacts/performance/ux/journey-${label}.json`, JSON.stringify(result, null, 2));
console.log(label, 'homeHero', homeHero, 'homeLoad', homeLoad);
for (const s of steps) console.log(s.idleMs ? `  ${s.name}: prefetch=${s.prefetchRsc.length} [${s.prefetchRsc.join(' ')}] scripts=${s.scripts} bytes=${s.bytes}` : `  ${s.name}: response=${s.responseMs} url=${s.urlMs} heading=${s.headingMs} complete=${s.completeMs} 404=${s.notFound} longTasks=${s.longTasks}/${s.longTaskMs}ms max=${s.maxLongTask} rsc=[${s.rsc.join(', ')}] scripts=${s.scripts}/${s.scriptBytes}B`);
if (result.errors.length) console.log('  errors:', result.errors);
await browser.close();
