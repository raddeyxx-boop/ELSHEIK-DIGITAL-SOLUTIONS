// Viewport-sized screenshots of specific sections (no sticky-header artifacts).
// Usage: node section-shots.mjs <label> <path> <selector-list> [widths] [locales]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [label, path, selectorArg, widthArg = '390,768,1440', localeArg = 'ar,en'] = process.argv.slice(2);
const selectors = selectorArg.split('|');
await fs.mkdir(`.artifacts/content/sections/${label}`, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
for (const locale of localeArg.split(',')) for (const width of widthArg.split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 900 } });
  await page.goto(`http://localhost:3200/${locale}/${path}`); await page.waitForLoadState('load'); await page.locator('main h1').first().waitFor({ timeout: 20000 }); await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'body > header, .elsheik-mobile-dock, .skip-link { visibility: hidden !important; } *{scroll-behavior:auto!important}' });
  for (const [index, selector] of selectors.entries()) {
    const target = page.locator(selector).first();
    if (!(await target.count())) { console.log('missing', selector); continue; }
    await target.scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
    await target.screenshot({ path: `.artifacts/content/sections/${label}/${locale}-${width}-${index}.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) console.log('OVERFLOW', locale, width);
  await page.close();
}
await browser.close(); console.log('done', label);
