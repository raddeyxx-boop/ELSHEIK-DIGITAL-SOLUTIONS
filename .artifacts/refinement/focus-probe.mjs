import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:3100/en/process');
const active = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}.${a.className}`.slice(0, 80) : null; });
console.log('load', await active());
await page.evaluate(() => { window.__focus = []; document.addEventListener('focusin', e => window.__focus.push(`${e.target.tagName}.${String(e.target.className).slice(0,40)} @${Math.round(performance.now())}`)); });
for (const id of ['process-automation', 'process-model', 'process-boundary']) {
  await page.locator(`section[aria-labelledby="${id}"]`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(6500);
  console.log(id, await active());
}
console.log(await page.evaluate(() => window.__focus));
await browser.close();
