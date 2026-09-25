import { test, expect, type Locator, type Page } from '@playwright/test';

// Live system diagrams, the grey-filler fixes, the dark-palette sections, the Home
// work gateway and navigation speed. Runs against the production fixture server.

const noOverflow = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
const pressed = (scope: Locator) => scope.locator('button[aria-pressed="true"]');
// Time from a click to the new state being in the DOM (same interaction, no waiting on animation).
async function clickLatency(button: Locator) {
  return button.evaluate(el => new Promise<number>(resolve => {
    const start = performance.now();
    const check = () => el.getAttribute('aria-pressed') === 'true' ? resolve(performance.now() - start) : requestAnimationFrame(check);
    (el as HTMLElement).click(); check();
  }));
}

for (const locale of ['en', 'ar'] as const) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  test(`${locale} Work system flow: runs once in view, then responds to click, keyboard and hover`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/work`);
    const flow = page.getByTestId('work-system-flow');
    const stages = flow.getByRole('list').getByRole('button');
    await expect(stages).toHaveCount(8);
    await flow.scrollIntoViewIfNeeded();
    // The single demonstration ends on the last stage and offers a replay.
    await expect(stages.nth(7)).toHaveAttribute('aria-pressed', 'true', { timeout: 8_000 });
    await expect(flow.getByRole('button', { name: locale === 'en' ? 'Replay' : 'أعد التشغيل' })).toBeVisible();
    expect(await clickLatency(stages.nth(2))).toBeLessThan(100);
    await expect(pressed(flow)).toHaveCount(1);
    await expect(flow).toContainText(locale === 'en' ? 'Determines the conversation' : 'يحدد حالة المحادثة');
    await stages.nth(2).focus();
    await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    await expect(stages.nth(3)).toBeFocused();
    await expect(stages.nth(3)).toHaveAttribute('aria-pressed', 'true');
    // A real pointer movement over a stage previews it.
    await stages.nth(5).hover();
    await expect(stages.nth(5)).toHaveAttribute('aria-pressed', 'true');
    const xs = await stages.evaluateAll(els => els.map(el => el.getBoundingClientRect().x));
    expect(dir === 'rtl' ? xs[0] > xs[7] : xs[0] < xs[7]).toBe(true);
    await noOverflow(page);
  });

  test(`${locale} Process: automation matrix shows the dependency chain around stage 05`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/process`);
    const matrix = page.locator('section[aria-labelledby="process-automation"] ol');
    const rows = matrix.locator(':scope > li');
    await expect(rows).toHaveCount(8);
    // Default: Automation selected, every phase tag lit.
    await expect(rows.nth(4)).toHaveAttribute('data-state', 'active');
    await expect(matrix.locator(':scope > li[data-lit]')).toHaveCount(8);
    for (const i of [0, 1, 2, 3]) await expect(rows.nth(i)).toHaveAttribute('data-state', 'done');
    expect(await clickLatency(rows.nth(6).getByRole('button'))).toBeLessThan(100);
    await expect(rows.nth(6)).toHaveAttribute('data-state', 'active');
    await expect(rows.nth(4)).toHaveAttribute('data-state', 'done');
    await expect(rows.nth(7)).not.toHaveAttribute('data-state', /./);
  });

  test(`${locale} Process: execution model runs a verified path and a failed verification with a human hand-off`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/${locale}/process`);
    const model = page.locator('section[aria-labelledby="process-model"]');
    const nodes = model.locator('ol > li');
    await expect(nodes).toHaveCount(7);
    await model.scrollIntoViewIfNeeded();
    await expect(nodes.nth(6)).toHaveAttribute('data-state', 'active', { timeout: 8_000 });
    await expect(nodes.nth(4)).toHaveAttribute('data-result', 'ok');
    await expect(model.locator('[data-branch]')).toHaveCount(0);
    await model.getByRole('button', { name: locale === 'en' ? 'Run: verification fails' : 'تشغيل: فشل التحقق' }).click();
    await expect(nodes.nth(4)).toHaveAttribute('data-result', 'fail', { timeout: 5_000 });
    await expect(model.locator('[data-branch]')).toHaveCount(1);
    await expect(model.locator('li[data-human][data-state="active"]')).toHaveCount(1, { timeout: 4_000 });
    await expect(nodes.nth(6)).toHaveAttribute('data-state', 'active', { timeout: 5_000 });
    await expect(model.locator('li[data-human][data-state]')).toHaveAttribute('data-state', 'done');
    await expect(model).toContainText(locale === 'en' ? 'not connected to a live system' : 'غير متصل بنظام فعلي');
    // Direct selection takes over at once.
    const context = nodes.nth(1).getByRole('button');
    expect(await clickLatency(context)).toBeLessThan(100);
    await expect(model.locator('[data-branch]')).toHaveCount(0);
    await context.focus();
    await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    await expect(nodes.nth(2).getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test(`${locale} Process: feedback loop travels 01 → 08 → new evidence → 01 and stages are selectable`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/process`);
    const loop = page.locator('section[aria-labelledby="process-loop"]');
    const chips = loop.getByRole('group').getByRole('button');
    await expect(chips).toHaveCount(9);
    await expect(loop.locator('path[data-active]')).toHaveCount(1); // resting state: the new-evidence arc
    await loop.scrollIntoViewIfNeeded();
    // The run passes the arc and returns to Discovery with every stage done.
    await expect(loop.locator('g[data-state="done"]')).toHaveCount(7, { timeout: 8_000 });
    await expect(chips.first()).toHaveAttribute('data-state', 'active');
    expect(await clickLatency(chips.nth(4))).toBeLessThan(100);
    await expect(loop.locator('g[data-state="active"]')).toHaveCount(1);
    await expect(loop.locator('[class*="loopReadout"] > div').first()).toContainText(locale === 'en' ? 'Automation' : 'الأتمتة');
  });

  test(`${locale} About automation chain uses the shared live flow`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/about`);
    const flow = page.getByTestId('about-flow');
    await expect(flow.locator('li')).toHaveCount(6);
    await flow.scrollIntoViewIfNeeded();
    await expect(flow.locator('li').nth(5)).toHaveAttribute('data-state', 'active', { timeout: 8_000 });
    await flow.locator('li').nth(2).getByRole('button').click();
    await expect(flow).toContainText(locale === 'en' ? 'Rules decide the valid next step.' : 'تحدد القواعد الخطوة التالية الصحيحة.');
  });

  test(`${locale} customer journey: demonstration, pause, replay, instant details and no layout shift`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/work/relax-moon-spa-automation`);
    const list = page.getByRole('list', { name: locale === 'en' ? 'Customer journey stages' : 'مراحل رحلة العميل' });
    const stages = list.getByRole('button');
    await expect(stages).toHaveCount(8);
    await page.evaluate(() => { (window as unknown as { __shift: number }).__shift = 0; new PerformanceObserver(l => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) (window as unknown as { __shift: number }).__shift += e.value; }).observe({ type: 'layout-shift' }); });
    await list.scrollIntoViewIfNeeded();
    const pause = page.getByRole('button', { name: locale === 'en' ? 'Pause' : 'إيقاف مؤقت' });
    await expect(pause).toBeVisible({ timeout: 4_000 });
    await expect(stages.nth(2)).toHaveAttribute('aria-pressed', 'true', { timeout: 4_000 });
    await pause.click();
    const held = await pressed(list).textContent();
    await page.waitForTimeout(1_200);
    expect(await pressed(list).textContent()).toBe(held);
    // Demonstration-driven detail changes do not move the page.
    expect(await page.evaluate(() => (window as unknown as { __shift: number }).__shift)).toBeLessThan(0.01);
    await page.getByRole('button', { name: locale === 'en' ? 'Replay' : 'أعد التشغيل' }).click();
    await expect(stages.nth(7)).toHaveAttribute('aria-pressed', 'true', { timeout: 8_000 });
    expect(await clickLatency(stages.nth(5))).toBeLessThan(100);
    await expect(page.locator('#journey-stage-detail')).toContainText(locale === 'en' ? 'Selected stage: Availability check' : 'المرحلة المحددة: فحص التوفر');
    await expect(page.locator('#journey-stage-detail')).not.toHaveAttribute('aria-live', /./);
  });

  test(`${locale} reduced motion: no automatic demonstrations, selection still works`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/work`);
    const flow = page.getByTestId('work-system-flow');
    await flow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_500);
    await expect(flow.getByRole('list').getByRole('button').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(flow.getByRole('button', { name: locale === 'en' ? 'Run flow' : 'شغّل المسار' })).toBeVisible();
    // The global reduced-motion rule leaves at most 0.01ms.
    expect(parseFloat(await flow.locator('[class*="signal"]').evaluate(el => getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
    await flow.getByRole('list').getByRole('button').nth(4).click();
    await expect(flow.getByRole('list').getByRole('button').nth(4)).toHaveAttribute('aria-pressed', 'true');
    await page.goto(`/${locale}/process`);
    const model = page.locator('section[aria-labelledby="process-model"]');
    await model.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_500);
    await expect(model.locator('ol > li[data-state="active"]')).toHaveCount(1);
    await expect(model.locator('ol > li').nth(4)).toHaveAttribute('data-state', 'active');
  });

  test(`${locale} grids end after their last real item (no grey filler cells)`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [path, selector] of [[`/${locale}/insights`, 'section[aria-labelledby="journal-topics"] ul'], [`/${locale}/work/relax-moon-spa-automation`, 'dl[class*="grid4"] >> nth=1']] as const) {
      await page.goto(path);
      const grid = page.locator(selector);
      await expect(grid).toBeVisible();
      expect(await grid.evaluate(el => getComputedStyle(el).backgroundColor), path).toBe('rgba(0, 0, 0, 0)');
      expect(await grid.evaluate(el => getComputedStyle(el).rowGap), path).toBe('normal');
    }
  });

  test(`${locale} Human + Automation and the case-study CTA use the site's dark ground`, async ({ page }) => {
    await page.goto(`/${locale}/process`);
    const ground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await page.locator('section[aria-labelledby="process-boundary"]').evaluate(el => getComputedStyle(el).backgroundColor)).toBe(ground);
    await page.goto(`/${locale}/work/relax-moon-spa-automation`);
    const cta = page.locator('section:has(> div > a[href$="/contact"])').last();
    expect(await cta.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(ground);
  });

  test(`${locale} Home work gateway is a bordered panel, not a lime slab`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    const gateway = page.locator(`main a[href="/${locale}/work"][class*="workAll"]`);
    await gateway.scrollIntoViewIfNeeded();
    const style = await gateway.evaluate(el => { const s = getComputedStyle(el); return { bg: s.backgroundColor, border: s.borderTopWidth }; });
    expect(style.bg).not.toBe('rgb(202, 255, 74)');
    expect(style.border).toBe('1px');
    await expect(page.locator(`main a[href="/${locale}/work/relax-moon-spa-automation"]`).first()).toBeVisible();
  });
}

for (const width of [320, 360, 375, 390, 412, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920, 2560]) {
  test(`live components fit at ${width}px (en + ar)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['en', 'ar']) for (const path of ['/work', '/process', '/about', '/work/relax-moon-spa-automation', '', '/insights']) {
      await page.goto(`/${locale}${path}`);
      await noOverflow(page);
    }
  });
}

test('landscape phone: journey and flows fit', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  for (const path of ['/en/work', '/ar/process', '/en/work/relax-moon-spa-automation']) { await page.goto(path); await noOverflow(page); }
});

test('header navigation between prerendered routes responds quickly, on repeat visits too', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await page.waitForTimeout(1_500);
  const routes = ['/en/services', '/en/work', '/en/process', '/en/about', '/en/insights', '/en/contact', '/en'];
  const times: number[] = [];
  for (let lap = 0; lap < 2; lap++) for (const href of routes) {
    // Measured in the page, from the click to the destination heading.
    times.push(await page.evaluate(target => new Promise<number>(resolve => {
      const before = document.querySelector('main h1')?.textContent;
      const link = document.querySelector<HTMLAnchorElement>(`header nav a[href="${target}"]`)!;
      const start = performance.now();
      const check = () => { const h = document.querySelector('main h1')?.textContent; if (location.pathname === target && h && h !== before) resolve(performance.now() - start); else requestAnimationFrame(check); };
      link.click(); requestAnimationFrame(check);
    }), href));
    await page.waitForTimeout(600);
  }
  // Generous CI budget; measured locally at 33-54 ms per route.
  for (const ms of times) expect(ms).toBeLessThan(1_000);
});
