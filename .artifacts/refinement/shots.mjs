// Section screenshots for the refinement pass (after each live demo has finished).
// Usage: node shots.mjs <baseUrl> <prefix> [widths=1440,390] [locales=en,ar]
import { chromium } from '@playwright/test';
const [base = 'http://127.0.0.1:3100', prefix = 'after', widthArg = '1440,390', localeArg = 'en,ar'] = process.argv.slice(2);
const targets = [
  ['01-insights-topics', '/insights', 'section[aria-labelledby="journal-topics"]'],
  ['02-work-system-flow', '/work', '[data-testid="work-system-flow"]'],
  ['03-automation-by-design', '/process', 'section[aria-labelledby="process-automation"]'],
  ['04-execution-model', '/process', 'section[aria-labelledby="process-model"]'],
  ['05-human-automation', '/process', 'section[aria-labelledby="process-boundary"]'],
  ['06-feedback-loop', '/process', 'section[aria-labelledby="process-loop"]'],
  ['07-about-automation', '/about', '[data-testid="about-automation"]'],
  ['08-guardrails', '/work/relax-moon-spa-automation', 'dl[class*="grid4"] >> nth=1 >> xpath=..'],
  ['09-customer-journey', '/work/relax-moon-spa-automation', '#journey-stage-detail >> xpath=ancestor::section'],
  ['10-case-cta', '/work/relax-moon-spa-automation', 'main > section:last-of-type, section:has(> div > a[href$="/contact"]):last-of-type'],
  ['11-selected-work', '', 'section:has(a[href$="/work"][class*="workAll"])'],
];
const browser = await chromium.launch();
for (const locale of localeArg.split(',')) for (const width of widthArg.split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  let current = null;
  for (const [name, path, selector] of targets) {
    const url = `${base}/${locale}${path}`;
    if (current !== url) { await page.goto(url); current = url; await page.evaluate(() => document.fonts.ready); }
    const el = page.locator(selector).first();
    if (!(await el.count())) { console.log('missing', locale, width, name); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(6500);
    await el.screenshot({ path: `.artifacts/refinement/${prefix}/${locale}-${width}-${name}.png`, style: 'body > header,.skip-link{opacity:0!important}' });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(locale, width, 'errors', errors.length ? errors : 0, 'overflow(last page)', overflow);
  await page.close();
}
await browser.close();
