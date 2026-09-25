// Mobile: open the menu and tap a destination, on emulated slow 4G (150 ms RTT).
// Records the time to content, whether the route loading skeleton was shown, and
// whether the tap needed a server round trip (a non-prefetch RSC request).
import { chromium } from '@playwright/test';
const base = process.argv[2] || 'http://localhost:3200';
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
const rsc = [];
page.on('request', r => { const h = r.headers(); if (h.rsc === '1') rsc.push({ t: Date.now(), prefetch: !!h['next-router-prefetch'], url: r.url().replace(base, '') }); });
await page.goto(base + '/en');
await page.waitForTimeout(4000); // a reader on the page before opening the menu
for (const href of ['/en/work', '/en/process', '/en/about', '/en/services', '/en/insights', '/en/contact', '/en']) {
  await page.locator('header button[aria-controls="mobile-nav"]').tap();
  await page.waitForTimeout(250); // finger travel to the link
  const t = Date.now();
  const r = await page.evaluate(target => new Promise(resolve => {
    const before = document.querySelector('main h1')?.textContent, start = performance.now(); let skeleton = false;
    const check = () => {
      if (document.querySelector('[aria-label="Loading content"]')) skeleton = true;
      const h = document.querySelector('main h1')?.textContent;
      if (location.pathname === target && h && h !== before) resolve({ ms: Math.round(performance.now() - start), skeleton }); else requestAnimationFrame(check);
    };
    document.querySelector(`#mobile-nav a[href="${target}"]`).click(); requestAnimationFrame(check);
  }), href);
  const roundTrips = rsc.filter(x => x.t >= t && !x.prefetch).map(x => x.url);
  console.log(href.padEnd(14), `${r.ms}ms`.padStart(7), r.skeleton ? 'SKELETON' : 'no skeleton', roundTrips.length ? `server round trip: ${roundTrips.join(' ')}` : 'served from prefetch');
  await page.waitForTimeout(3000);
}
await browser.close();
