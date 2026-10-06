import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const locale of ['en', 'ar']) {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const [width, height] of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://localhost:3000/${locale}/technologies`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.artifacts/technologies/backend-security/${locale}-${width}.png`, fullPage: true });
    await page.locator('[data-technology-field]').screenshot({ path: `.artifacts/technologies/backend-security/${locale}-field-${width}.png`, style: 'body > header,.elsheik-mobile-dock,nextjs-portal{opacity:0!important}' });
  }
  await page.close();
}
await browser.close();
