// Rapid interaction with every live diagram / stage control. Records, per component:
// worst Event Timing duration (the measure INP is built from), network requests
// fired during the clicks, whether the document navigated, and layout shift.
// Usage: node tabs-probe.mjs <base> [--mobile] [--cpu=4]
import { chromium } from '@playwright/test';
const base = process.argv[2] || 'http://localhost:3200';
const mobile = process.argv.includes('--mobile');
const cpu = Number(process.argv.find(a => a.startsWith('--cpu='))?.split('=')[1] || 1);
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await page.addInitScript(() => {
  window.__events = []; window.__cls = 0;
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.interactionId) window.__events.push({ name: e.name, ms: Math.round(e.duration) }); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
});
const targets = [
  ['/en/process', 'Process stages', 'section[aria-labelledby="process-framework"] [role="tab"]'],
  ['/en/process', 'Automation by Design', 'section[aria-labelledby="process-automation"] ol > li > button'],
  ['/en/process', 'Workflow (execution model)', 'section[aria-labelledby="process-model"] ol > li h3 button'],
  ['/en/process', 'Failure path run', 'section[aria-labelledby="process-model"] [class*="modelBar"] button'],
  ['/en/process', 'Feedback Loop', 'section[aria-labelledby="process-loop"] [role="group"] button'],
  ['/en/work', 'System Flow', '[data-testid="work-system-flow"] ol button'],
  ['/en/about', 'About chain', '[data-testid="about-flow"] ol button'],
  ['/en/work/relax-moon-spa-automation', 'Customer Journey', 'ol[aria-label="Customer journey stages"] button'],
];
let current = '';
for (const [path, name, selector] of targets) {
  if (current !== path) { await page.goto(base + path); current = path; await page.waitForTimeout(1500); }
  const items = page.locator(selector);
  await items.first().scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const requests = [];
  const onRequest = r => { if (!r.url().startsWith('data:')) requests.push(`${r.resourceType()} ${r.url().replace(base, '')}`); };
  page.on('request', onRequest);
  const before = await page.evaluate(() => ({ events: window.__events.length, cls: window.__cls, marker: (window.__marker = Math.random()) }));
  const count = await items.count();
  for (let round = 0; round < 2; round++) for (let i = 0; i < count; i++) { await items.nth(i).click({ delay: 0 }); await page.waitForTimeout(40); }
  await page.waitForTimeout(600);
  page.off('request', onRequest);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const after = await page.evaluate(m => ({ events: window.__events.slice(m.events), cls: window.__cls - m.cls, sameDocument: window.__marker === m.marker }), before);
  const worst = Math.max(0, ...after.events.map(e => e.ms));
  console.log(`${name.padEnd(28)} clicks=${count * 2} worst event=${worst}ms (>16ms: ${after.events.length}) requests=${requests.length}${requests.length ? ' [' + requests.slice(0, 3).join(', ') + ']' : ''} sameDocument=${after.sameDocument} cls=${after.cls.toFixed(4)}`);
}
await browser.close();
