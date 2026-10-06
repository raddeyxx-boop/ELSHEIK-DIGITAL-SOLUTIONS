// Main-thread cost over a 5s idle window via CDP Performance metrics (port 3200).
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
// GPU=1 uses the machine's hardware GPU; the default headless renderer is SwiftShader (software).
const browser = await chromium.launch(process.env.GPU ? { args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] } : {}); const results = [];
const read = async cdp => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
for (const [label, route, width, height, scroll] of [['home hero visible', '/en', 1440, 900, 0], ['home hero offscreen', '/en', 1440, 900, 4000], ['home mobile hero visible', '/en', 390, 844, 0], ['contact hero visible', '/en/contact', 1440, 900, 0]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
  await page.goto('http://localhost:3200' + route); await page.waitForTimeout(3000);
  if (scroll) { await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scroll); await page.waitForTimeout(1000); }
  const before = await read(cdp);
  const frames = await page.evaluate(() => new Promise(resolve => { let n = 0; const start = performance.now(); const tick = now => { n++; if (now - start < 5000) requestAnimationFrame(tick); else resolve(n); }; requestAnimationFrame(tick); }));
  const after = await read(cdp);
  const ms = k => Math.round((after[k] - before[k]) * 1000);
  results.push({ label, route, width, scroll, windowMs: 5000, taskMs: ms('TaskDuration'), scriptMs: ms('ScriptDuration'), layoutMs: ms('LayoutDuration'), styleMs: ms('RecalcStyleDuration'), rafFrames: frames,
    canvasState: await page.evaluate(() => document.querySelector('[data-hero-pixels]')?.querySelector('[data-state]')?.getAttribute('data-state') ?? 'n/a'),
    dpr: await page.evaluate(() => devicePixelRatio) });
  await page.close();
}
await browser.close();
await fs.writeFile(`.artifacts/performance/runtime-${process.env.GPU ? 'gpu' : 'swiftshader'}.json`,JSON.stringify(results, null, 2));
console.table(results);
