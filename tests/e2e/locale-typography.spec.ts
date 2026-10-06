import { test, expect } from '@playwright/test';

test('Arabic pages render Arabic text in Tajawal; English pages keep their typeface and fetch no font', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.woff2')) fonts.push(request.url()); });
  await page.goto('/en/contact');
  await page.waitForLoadState('load');
  expect(fonts).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).not.toContain('Tajawal');

  await page.goto('/ar/contact');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator('main h1').evaluate(h => getComputedStyle(h).fontFamily)).toMatch(/^"?Tajawal/);
  expect(await page.evaluate(() => [...document.fonts].filter(f => f.family.includes('Tajawal') && f.status === 'loaded').length)).toBeGreaterThan(0);
  expect(fonts.every(url => url.includes('/fonts/tajawal/tajawal-arabic-'))).toBe(true);
});

for (const [locale, heading, dir] of [['ar', 'هذا المسار خارج النظام.', 'rtl'], ['en', 'This route is outside the system.', 'ltr']] as const) {
  test(`${locale}: unknown paths render the localized 404 inside the site layout`, async ({ page }) => {
    await page.goto(`/${locale}/no-such-page`);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
}

test('case study: selecting a workflow stage reveals its input, action, decision, data and next step', async ({ page }) => {
  await page.goto('/en/work/relax-moon-spa-automation');
  const stages = page.getByRole('list', { name: 'Customer journey stages' });
  await stages.getByRole('button', { name: /Availability check/ }).click();
  const detail = page.locator('#journey-stage-detail');
  await expect(detail).toContainText('Selected stage: Availability check');
  for (const label of ['Input', 'System action', 'Decision', 'Data', 'Next']) await expect(detail.getByText(label, { exact: true })).toBeVisible();
  await expect(detail).toContainText('at least one specialist is eligible');
  await stages.getByRole('button', { name: /Date selection/ }).click();
  await expect(detail.getByText('Decision', { exact: true })).toHaveCount(0);
});
