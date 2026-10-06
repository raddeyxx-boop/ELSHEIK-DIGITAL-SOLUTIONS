// Detects full document navigations. A marker on window survives only a client-side
// (soft) navigation; every document request is also recorded. Also records whether
// the <header> element is the same node after each navigation (shell stays mounted).
// Usage: node reload-probe.mjs <baseUrl> <label> [--mobile]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base = 'http://localhost:3200', label = 'run'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const mobile = process.argv.includes('--mobile');
const browser = await chromium.launch();
const page = await browser.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const documents = [];
page.on('request', r => { if (r.resourceType() === 'document') documents.push(r.url().replace(base, '')); });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
await page.goto(base + '/en');
await page.waitForTimeout(1500);
const mark = () => page.evaluate(() => { window.__soft = (window.__soft || 0) + 1; window.__header = document.querySelector('body > header'); });
const results = [];
async function step(name, act, expectPath) {
  await mark();
  const docsBefore = documents.length;
  const start = Date.now();
  await act();
  await page.waitForURL(u => new URL(u).pathname + new URL(u).hash === expectPath || new URL(u).pathname === expectPath, { timeout: 15000 });
  await page.locator('main h1').first().waitFor();
  const r = await page.evaluate(() => ({ soft: Boolean(window.__soft), sameHeader: window.__header === document.querySelector('body > header') }));
  results.push({ name, path: expectPath, ms: Date.now() - start, soft: r.soft, headerKept: r.sameHeader, documentRequests: documents.slice(docsBefore) });
  await page.waitForTimeout(500);
}
const nav = href => mobile
  ? async () => { await page.locator('header button[aria-controls="mobile-nav"]').click(); await page.locator(`#mobile-nav a[href="${href}"]`).first().click(); }
  : async () => { await page.locator(`header nav a[href="${href}"]`).first().click(); };
for (const lap of [1, 2]) for (const p of ['/en/services', '/en/work', '/en/process', '/en/about', '/en/insights', '/en/contact', '/en']) await step(`lap${lap} header ${p}`, nav(p), p);
await step('work card -> case study', async () => { await page.goto(base + '/en/work').then(mark); await page.locator('main a[href="/en/work/relax-moon-spa-automation"]').first().click(); }, '/en/work/relax-moon-spa-automation');
await step('case study CTA -> contact', async () => { await page.locator('main a[href="/en/contact"]').last().click(); }, '/en/contact');
await step('footer -> technologies', async () => { await page.locator('footer a[href="/en/technologies"]').click(); }, '/en/technologies');
await step('logo -> home', async () => { await page.locator('body > header > div > a[href="/en"]').first().click(); }, '/en');
await step('home CTA -> start a project', async () => { if (mobile) { await page.locator('header button[aria-controls="mobile-nav"]').click(); await page.locator('#mobile-nav a.button[href="/en/contact"]').click(); } else await page.locator('header a[href="/en/contact"]').last().click(); }, '/en/contact');
await step('language en -> ar', async () => { await (mobile ? (async () => { await page.locator('header button[aria-controls="mobile-nav"]').click(); await page.locator('#mobile-nav a[hreflang="ar"]').click(); })() : page.locator('header a[hreflang="ar"]').first().click()); }, '/ar/contact');
await step('ar header -> work', nav('/ar/work'), '/ar/work');
await step('language ar -> en', async () => { await (mobile ? (async () => { await page.locator('header button[aria-controls="mobile-nav"]').click(); await page.locator('#mobile-nav a[hreflang="en"]').click(); })() : page.locator('header a[hreflang="en"]').first().click()); }, '/en/work');
await step('back', () => page.goBack(), '/ar/work');
await step('back again', () => page.goBack(), '/ar/contact');
await step('forward', () => page.goForward(), '/ar/work');
await fs.writeFile(`.artifacts/zero-refresh/reload-${label}.json`, JSON.stringify({ label, mobile, results, errors }, null, 2));
for (const r of results) console.log(`${r.name.padEnd(34)} ${String(r.ms).padStart(5)}ms soft=${r.soft} headerKept=${r.headerKept} docs=[${r.documentRequests.join(' ')}]`);
console.log('errors', errors.length ? errors : 0);
await browser.close();
