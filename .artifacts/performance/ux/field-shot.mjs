// Screenshots the hero SystemField with SMIL frozen at t=1.3s and PixelBlast hidden, for pixel comparison.
import { chromium } from '@playwright/test';
const [base, name] = [process.argv[2], process.argv[3]];
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
for (const [w, h, locale] of [[1440, 900, 'en'], [390, 844, 'ar']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; });
  await page.goto(`${base}/${locale}`); await page.locator('[class*=system-field-module__][class*=__field]').waitFor();
  await page.addStyleTag({ content: '[class*=__module]{transition:none!important}' });
  await page.evaluate(() => document.querySelectorAll('svg').forEach(s => { s.pauseAnimations?.(); s.setCurrentTime?.(1.3); }));
  await page.waitForTimeout(400);
  const field = page.locator('[class*=system-field-module__][class*=__field]');
  await field.evaluate(e => e.querySelectorAll('[class*=__module]').forEach(m => m.classList.forEach(c => { if (c.includes('__active')) m.classList.remove(c); })));
  await field.screenshot({ path: `.artifacts/performance/ux/field-${name}-${locale}-${w}.png`, animations: 'disabled' });
  await page.close();
}
await browser.close();
