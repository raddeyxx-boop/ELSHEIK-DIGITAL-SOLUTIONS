// Memory across repeated real journeys: after forced GC at each checkpoint, records JS heap,
// DOM nodes, JS event listeners, detached documents and live WebGL contexts.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200';
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
await page.addInitScript(() => {
  window.__contexts = new Set(); const o = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = o.call(this, t, ...a); if (c && /webgl/.test(t)) window.__contexts.add(c); return c; };
});
const rows = [];
const checkpoint = async (cycle, where) => {
  await page.waitForTimeout(800); await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(300);
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  const live = await page.evaluate(() => [...window.__contexts].filter(c => !c.isContextLost()).length);
  rows.push({ cycle, where, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), domNodes: m.Nodes, listeners: m.JSEventListeners, documents: m.Documents, liveWebGL: live });
};
const nav = async href => { await page.locator(`header nav a[href="${href}"]`).first().click(); await page.waitForURL(`**${href}`); await page.locator('main h1').first().waitFor(); await page.waitForTimeout(600); };
await page.goto(base + '/en'); await page.waitForLoadState('load'); await checkpoint(0, 'Home loaded');
for (let cycle = 1; cycle <= 3; cycle++) {
  await nav('/en/work');
  await page.locator('main a[href="/en/work/relax-moon-spa-automation"]').first().click(); await page.getByTestId('operations-console').waitFor();
  const demo = page.getByTestId('operations-console'); await demo.scrollIntoViewIfNeeded();
  for (let i = 0; i < 5; i++) { await demo.getByRole('tab', { name: 'Bookings', exact: true }).click(); await demo.getByRole('button', { name: /DEMO-RM-00/ }).first().click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('Escape'); await demo.getByRole('tab', { name: 'Activity', exact: true }).click(); }
  await checkpoint(cycle, 'case study + 5 dialogs');
  await page.goBack(); await page.waitForURL('**/en/work'); await nav('/en/contact');
  await page.locator('form input').first().fill('Memory check'); await nav('/en/about'); await nav('/en/services'); await nav('/en');
  await checkpoint(cycle, 'back on Home');
}
await browser.close();
await fs.writeFile('.artifacts/performance/ux/memory.json', JSON.stringify(rows, null, 2));
console.table(rows);
