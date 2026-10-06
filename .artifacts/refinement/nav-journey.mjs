// Click-through navigation benchmark over the header routes (real clicks, real browser).
// Per click, page clock ms after the click event:
//   url       location.pathname reaches the destination
//   content   the destination <h1> has replaced the previous one and no route
//             loading placeholder remains
// Two laps: the second shows whether a repeat visit is still slow.
// Usage: node nav-journey.mjs <baseUrl> <label> [--locale=ar] [--mobile] [--gpu]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base = 'http://127.0.0.1:3100', label = 'run'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flag = name => process.argv.find(a => a.startsWith(`--${name}`));
const locale = flag('locale')?.split('=')[1] || 'en', mobile = !!flag('mobile');
const browser = await chromium.launch(flag('gpu') ? { args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] } : {});
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [], rsc = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('requestfinished', r => { const h = r.headers(); if (h.rsc === '1') rsc.push({ t: Date.now(), prefetch: !!h['next-router-prefetch'], url: r.url().replace(base, '').split('?')[0], ms: Math.round(r.timing().responseEnd) }); });
await page.addInitScript(() => {
  window.__arm = target => {
    const heading = () => document.querySelector('main h1')?.textContent.trim() || '';
    const s = { target, previous: heading() }; window.__step = s;
    addEventListener('click', () => { s.click = performance.now(); }, { capture: true, once: true });
    const tick = () => {
      const now = performance.now();
      if (s.click) {
        if (!s.url && location.pathname === target) s.url = now - s.click;
        const h = heading();
        if (s.url && !s.content && h && h !== s.previous && !document.querySelector('[aria-label="Loading content"],[aria-label="جارٍ تحميل المحتوى"]')) s.content = now - s.click;
        if (s.content || now - s.click > 30000) { s.done = true; return; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
});
const L = `/${locale}`;
const header = href => Object.assign(async () => {
  if (mobile) await page.locator(`#mobile-nav a[href="${href}"]`).first().click();
  else await page.locator(`header nav a[href="${href}"]`).first().click();
}, { menu: true });
const routes = ['', '/services', '/work', '/process', '/about', '/insights', '/contact', ''].map(p => L + p);
const steps = [];
async function step(name, target, act) {
  // Mobile: open the menu first, so the timer starts at the link tap.
  if (mobile && act.menu) await page.locator('header button[aria-controls="mobile-nav"]').click();
  await page.evaluate(t => window.__arm(t), target);
  const wall = Date.now();
  await act();
  await page.waitForFunction(() => window.__step.done, null, { timeout: 45000 }).catch(() => {});
  const s = await page.evaluate(() => window.__step);
  steps.push({ name, urlMs: s.url && Math.round(s.url), contentMs: s.content && Math.round(s.content), rsc: rsc.filter(x => x.t >= wall && !x.prefetch).map(x => `${x.url} ${x.ms}ms`) });
  // Dwell like a reader so viewport prefetching can happen.
  await page.waitForTimeout(1200);
}
await page.goto(base + L);
await page.locator('main h1').waitFor();
await page.waitForTimeout(2500);
for (const lap of [1, 2]) {
  for (let i = 1; i < routes.length; i++) await step(`lap${lap} ${routes[i - 1] || '/'} -> ${routes[i]}`, routes[i], header(routes[i]));
  await step(`lap${lap} Home -> Work`, `${L}/work`, header(`${L}/work`));
  await step(`lap${lap} Work -> case study`, `${L}/work/relax-moon-spa-automation`, async () => { await page.locator(`main a[href="${L}/work/relax-moon-spa-automation"]`).first().click(); });
  await step(`lap${lap} case study -> Work`, `${L}/work`, header(`${L}/work`));
  await step(`lap${lap} Work -> case study (2)`, `${L}/work/relax-moon-spa-automation`, async () => { await page.locator(`main a[href="${L}/work/relax-moon-spa-automation"]`).first().click(); });
  await step(`lap${lap} case study -> Start a project`, `${L}/contact`, async () => { await page.locator('main a[href$="/contact"]').last().click(); });
  await step(`lap${lap} Contact -> Home`, L, header(L));
}
const result = { label, base, locale, mobile, steps, errors: [...new Set(errors)].slice(0, 10) };
await fs.writeFile(`.artifacts/refinement/nav-${label}.json`, JSON.stringify(result, null, 2));
const worst = Math.max(...steps.map(s => s.contentMs || 99999));
console.log(label, 'worst content', worst, 'ms');
for (const s of steps) console.log(`  ${s.name.padEnd(46)} url=${String(s.urlMs).padStart(5)} content=${String(s.contentMs).padStart(5)} ${s.rsc.join(', ')}`);
if (result.errors.length) console.log('  errors:', result.errors);
await browser.close();
