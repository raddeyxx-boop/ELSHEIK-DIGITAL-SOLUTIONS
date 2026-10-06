import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style'); style.textContent = 'nextjs-portal { display: none !important; }'; document.head.append(style);
  }));
});

const copy = {
  en: { h1: 'A disciplined path from ambiguity to a dependable system.', automation: 'Automation', testing: 'Testing', evolution: 'Evolution', discovery: 'Discovery', selected: 'Selected stage: 05 Automation', next: 'Next stage', loop: 'Back to discovery', objective: 'Turn repeated operations and business rules into workflows that can be executed, verified and observed.', forward: 'ArrowRight' },
  ar: { h1: 'مسار منضبط يحوّل الغموض إلى نظام موثوق.', automation: 'الأتمتة', testing: 'الاختبار', evolution: 'التطوير', discovery: 'الاكتشاف', selected: 'المرحلة المحددة: 05 الأتمتة', next: 'المرحلة التالية', loop: 'العودة إلى الاكتشاف', objective: 'تحويل العمليات المتكررة والقواعد التشغيلية إلى مسارات قابلة للتنفيذ والتحقق والمراقبة.', forward: 'ArrowLeft' },
} as const;


for (const locale of ['en', 'ar'] as const) {
  const c = copy[locale];

  test(`${locale} process stage navigator`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/process`);
    await expect(page.locator('h1')).toHaveText(c.h1);
    await expect(page.locator('main > header')).toHaveAttribute('data-system-label', 'DELIVERY SYSTEM / 08 STAGES');

    const tabs = page.getByRole('tablist').getByRole('tab');
    await expect(tabs).toHaveCount(8);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);

    const automation = page.getByRole('tab', { name: new RegExp(`05\\s*${c.automation}`) });
    await automation.click();
    await expect(automation).toHaveAttribute('aria-selected', 'true');
    const panel = page.getByRole('tabpanel');
    await expect(panel).toContainText(c.objective);
    for (const code of ['OBJ', 'IN', 'ACT', 'AUTO', 'GATE 05', 'OUT', 'QA']) await expect(panel.getByText(code, { exact: true })).toBeVisible();
    await expect(page.getByText(c.selected, { exact: true })).toHaveCount(1);
    if (locale === 'ar') expect(await page.locator('main').innerText()).not.toContain('Selected stage');

    // Arrow keys follow reading direction; Home/End jump to the ends.
    await automation.focus();
    await page.keyboard.press(c.forward);
    await expect(page.getByRole('tab', { name: new RegExp(`06\\s*${c.testing}`) })).toBeFocused();
    await expect(page.getByRole('tab', { name: new RegExp(`06\\s*${c.testing}`) })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toHaveAttribute('tabindex', '-1');

    // RTL places stage 01 at the reading start.
    const [first, last] = await Promise.all([tabs.first().boundingBox(), tabs.last().boundingBox()]);
    expect(locale === 'ar' ? first!.x > last!.x : first!.x < last!.x).toBe(true);

    // Next advances; after 08 the control loops back to 01 Discovery.
    const advance = page.locator('main button', { hasText: c.next }).last();
    await advance.click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await tabs.last().click();
    const loop = page.locator('main button[data-loop]');
    await expect(loop).toContainText(c.loop);
    await expect(loop).toContainText(c.discovery);
    await loop.click();
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

    for (const id of ['process-automation', 'process-model', 'process-artifacts', 'process-responsibility', 'process-gates', 'process-boundary', 'process-failure', 'process-loop', 'process-cta']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.locator('#process-model').locator('xpath=ancestor::section').locator('ol > li')).toHaveCount(7);
    await expect(page.locator('main a[href$="/contact"]').last()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });

  for (const width of [360, 390, 430, 768, 1024]) {
    test(`${locale} process responsive ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/process`);
      const tabs = page.getByRole('tab');
      await expect(tabs).toHaveCount(8);
      for (const box of await tabs.evaluateAll(els => els.map(el => el.getBoundingClientRect()))) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await tabs.nth(4).click();
      await expect(page.getByRole('tabpanel')).toContainText(c.objective);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test(`${locale} process reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/process`);
    await page.getByRole('tab').nth(2).click();
    await expect(page.getByRole('tabpanel')).toHaveCSS('animation-name', 'none');
  });
}
