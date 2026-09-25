// Full-page screenshots for visual review. Usage: node shots.mjs <label> [routes,csv] [widths,csv]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [label = 'run', routeArg, widthArg] = process.argv.slice(2);
const base = 'http://localhost:3200';
const paths = (routeArg || ',work,work/relax-moon-spa-automation,insights,technologies,services,about,contact').split(',');
const widths = (widthArg || '390,768,1440').split(',').map(Number);
await fs.mkdir(`.artifacts/content/shots/${label}`, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
for (const locale of ['ar', 'en']) for (const path of paths) for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 900 } });
  await page.goto(`${base}/${locale}${path ? '/' + path : ''}`); await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  // Reveal in-view animations by scrolling through the page, then return to top.
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); });
  const name = `${locale}-${(path || 'home').replaceAll('/', '_')}-${width}.png`;
  await page.screenshot({ path: `.artifacts/content/shots/${label}/${name}`, fullPage: true, style: '.elsheik-mobile-dock{visibility:hidden!important}' });
  await page.close();
}
await browser.close(); console.log('done', label);
