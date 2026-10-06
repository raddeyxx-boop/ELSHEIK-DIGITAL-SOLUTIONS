// Contact form browser check on the production build (port 3200).
// The POST is fulfilled in the browser; nothing reaches /api/inquiries or the CMS.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch(); const results = [];
for (const [locale, width, height] of [['en', 1440, 900], ['ar', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [], posts = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/api/inquiries', async route => { posts.push(route.request().postDataJSON()); await route.fulfill({ json: { ok: true, persisted: false } }); });
  await page.goto(`http://localhost:3200/${locale}/contact`);
  const form = page.locator('form'); await form.waitFor();
  const inputs = form.locator('input:not([tabindex="-1"])');
  // 1. Empty submit must be rejected client-side.
  await form.locator('button').last().click(); await page.waitForTimeout(300);
  const emptyInvalid = await form.locator('[aria-invalid=true]').count();
  // 2. Invalid values: 1-char name, bad email, 5-char description.
  await inputs.nth(0).fill('A'); await form.locator('input[type=email]').fill('not-an-email'); await form.locator('textarea').fill('short');
  await form.locator('button').last().click(); await page.waitForTimeout(300);
  const invalidFields = await form.locator('[aria-invalid=true]').count();
  const postsAfterInvalid = posts.length;
  // 3. Valid values must submit once with the same payload shape.
  await inputs.nth(0).fill('Test Person'); await form.locator('input[type=email]').fill('person@example.com');
  await form.locator('textarea').fill('We need a booking workflow that coordinates two branches.');
  await form.locator('button').last().click(); await page.waitForTimeout(800);
  results.push({ locale, width, emptyInvalid, invalidFields, postsAfterInvalid, postsAfterValid: posts.length, payload: posts[0], formResetAfterOk: await inputs.nth(0).inputValue() === '', errors,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  await page.close();
}
await browser.close();
await fs.writeFile('.artifacts/performance/contact-check.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
