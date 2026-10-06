import { test, expect, type Page } from '@playwright/test';

// The header is the single global navigation: seven destinations, the language
// switch and the "Start a project" CTA. No floating or bottom dock exists.
const destinations = {
  en: [['', 'Home'], ['services', 'Services'], ['work', 'Work'], ['process', 'Process'], ['about', 'About'], ['insights', 'Insights'], ['contact', 'Contact']],
  ar: [['', 'الرئيسية'], ['services', 'الخدمات'], ['work', 'أعمالنا'], ['process', 'كيف نعمل'], ['about', 'من نحن'], ['insights', 'رؤى'], ['contact', 'تواصل معنا']],
} as const;
const cta = { en: 'Start a project', ar: 'ابدأ مشروعك' } as const;
const language = { en: 'العربية', ar: 'English' } as const;
const primary = (page: Page) => page.locator('header nav[aria-label="Primary navigation"]');
const noDock = async (page: Page) => expect(page.locator('.elsheik-mobile-dock, .elsheik-quick-dock, .dock-panel, .dock-outer')).toHaveCount(0);

for (const locale of ['en', 'ar'] as const) {
  for (const width of [1920, 1440, 1366, 1280, 1180, 1100, 1024, 1023, 901, 768, 430, 390, 375, 360, 320]) {
    test(`${locale} header layout ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}/process`);
      await page.evaluate(() => document.fonts.ready);
      await noDock(page);
      const toggle = page.locator('header button[aria-controls="mobile-nav"]');
      if (width >= 1024) {
        const nav = primary(page);
        await expect(nav).toBeVisible();
        await expect(toggle).toBeHidden();
        await expect(nav.getByRole('link')).toHaveText(destinations[locale].map(([, label]) => label));
        await expect(nav.locator('svg')).toHaveCount(0);
        // One row, and brand / navigation / actions never touch.
        const layout = await page.evaluate(() => {
          const groups = [...document.querySelectorAll('body > header > div > *')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect()).sort((a, b) => a.left - b.left);
          const links = [...document.querySelectorAll('header nav[aria-label="Primary navigation"] a')].map(a => a.getBoundingClientRect());
          return { gaps: groups.slice(1).map((g, i) => g.left - groups[i].right), rows: new Set(links.map(r => Math.round(r.top))).size, tallest: Math.max(...links.map(r => r.height)) };
        });
        expect(layout.rows).toBe(1);
        expect(layout.tallest).toBeLessThan(32);
        for (const gap of layout.gaps) expect(gap).toBeGreaterThanOrEqual(24);
        const xs = await nav.getByRole('link').evaluateAll(els => els.map(el => el.getBoundingClientRect().x));
        expect(locale === 'ar' ? xs[0] > xs[6] : xs[0] < xs[6]).toBe(true);
        await expect(page.locator('header .actions, header [class*="actions"]').getByRole('link', { name: cta[locale] })).toBeVisible();
      } else {
        await expect(primary(page)).toBeHidden();
        await expect(toggle).toBeVisible();
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        const menu = page.locator('#mobile-nav');
        for (const [, label] of destinations[locale]) await expect(menu.getByRole('link', { name: label, exact: true })).toBeVisible();
        await expect(menu.getByRole('link', { name: destinations[locale][3][1], exact: true })).toHaveAttribute('aria-current', 'page');
        await expect(menu.getByRole('link', { name: language[locale] })).toBeVisible();
        await expect(menu.getByRole('link', { name: cta[locale] })).toBeVisible();
        await toggle.click();
        await expect(menu).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test(`${locale} every header destination navigates and is the only active link`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    for (const [path, label] of destinations[locale]) {
      await primary(page).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}${path ? `/${path}` : ''}$`));
      await expect(page.locator('main h1').first()).toBeVisible();
      const current = primary(page).locator('a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
    }
    await noDock(page);
  });

  test(`${locale} language switch and primary CTA`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/process`);
    await page.locator('header').getByRole('link', { name: cta[locale] }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/contact$`));
    const other = locale === 'en' ? 'ar' : 'en';
    await page.locator('header').getByRole('link', { name: language[locale] }).click();
    await expect(page).toHaveURL(new RegExp(`/${other}/contact$`));
    await expect(page.locator('html')).toHaveAttribute('dir', other === 'ar' ? 'rtl' : 'ltr');
  });
}
