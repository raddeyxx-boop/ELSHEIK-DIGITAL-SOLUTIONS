import { test, expect } from '@playwright/test';
// Runs against the production server whose CMS reads fail like ENOTFOUND
// (tests/fixtures/cms-unreachable-fetch.mjs), started by playwright.performance.config.ts.
test.use({ baseURL: 'http://127.0.0.1:3110' });
test.describe.configure({ mode: 'serial' });

test('public pages are served from the static cache during an outage, including the first request', async ({ request }) => {
  for (const path of ['/en', '/en/work', '/en/services', '/ar/insights', '/en/technologies', '/en/work/relax-moon-spa-automation']) {
    const started = Date.now();
    expect((await request.get(path)).ok(), path).toBe(true);
    expect(Date.now() - started, path).toBeLessThan(2_000);
  }
});

test('an on-demand CMS read still gets the SDK retries once, then the site stops waiting on them', async ({ request }) => {
  // Unknown slugs are not prerendered, so they read the CMS at request time.
  const started = Date.now();
  await request.get('/en/work/outage-probe-one');
  expect(Date.now() - started).toBeGreaterThan(6_000);
  const again = Date.now();
  await request.get('/en/work/outage-probe-two');
  expect(Date.now() - again).toBeLessThan(2_000);
});

for (const [locale, title] of [['en', 'Relax Moon Spa Automation'], ['ar', 'أتمتة ريلاكس مون سبا']] as const) {
  test(`${locale}: Work -> showcase case study renders from built-in content instead of a false 404`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/${locale}/work`);
    const started = Date.now();
    await page.locator(`main a[href="/${locale}/work/relax-moon-spa-automation"]`).first().click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(Date.now() - started).toBeLessThan(3_000);
    await expect(page.getByText('This route is outside the system')).toHaveCount(0);
    await expect(page.getByTestId('operations-console')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(errors).toEqual([]);
  });
}

test('an unknown case study during an outage reports the failure inside the site instead of claiming it does not exist', async ({ page }) => {
  await page.goto('/en/work/not-a-real-case-study');
  await expect(page.getByRole('heading', { name: 'Something did not load correctly.' })).toBeVisible();
  await expect(page.getByText('This route is outside the system')).toHaveCount(0);
  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
