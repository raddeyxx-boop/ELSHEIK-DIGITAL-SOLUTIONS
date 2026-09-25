// Logs every WebGL getContext call's duration during real clicks between routes.
import { chromium } from '@playwright/test';
const base = process.argv[2] || 'http://localhost:3200';
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.__gc = []; const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, opts) { const t = performance.now(); const r = original.call(this, type, opts); if (/webgl/.test(type)) window.__gc.push({ at: Math.round(t), ms: +(performance.now() - t).toFixed(1), path: location.pathname, inDoc: this.isConnected, w: this.width, h: this.height }); return r; };
});
await page.goto(base + '/en'); await page.waitForLoadState('load'); await page.waitForTimeout(2000);
for (const path of ['/en/work', '/en/services', '/en/about', '/en/contact', '/en', '/en/about', '/en/work']) {
  await page.locator(`header nav a[href="${path}"]`).first().click();
  await page.waitForURL(`**${path}`); await page.waitForTimeout(2500);
}
console.log(JSON.stringify(await page.evaluate(() => window.__gc)));
await browser.close();
