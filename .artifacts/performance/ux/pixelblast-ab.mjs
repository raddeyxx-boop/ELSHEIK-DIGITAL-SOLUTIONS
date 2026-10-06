// PixelBlast A/B on the hardware GPU: animated vs the component's own static
// reduced-motion field (no WebGL), idle and during a smooth scroll.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200';
const results = [];
for (const dpr of [1, 2]) for (const mode of ['animated', 'static']) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr, reducedMotion: mode === 'static' ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
  const browserCdp = await browser.newBrowserCDPSession();
  const procs = async () => Object.fromEntries((await browserCdp.send('SystemInfo.getProcessInfo')).processInfo.map(p => [p.type + ':' + p.id, p.cpuTime]));
  const metric = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  await page.goto(base + '/en'); await page.waitForLoadState('load'); await page.waitForTimeout(2000);
  const frames = () => page.evaluate(ms => new Promise(resolve => { const d = []; let last = performance.now(); const start = last; const tick = now => { d.push(now - last); last = now; if (now - start < ms) requestAnimationFrame(tick); else { d.sort((a, b) => a - b); resolve({ frames: d.length, p50: +d[d.length >> 1].toFixed(1), p95: +d[Math.floor(d.length * .95)].toFixed(1), over25: d.filter(x => x > 25).length }); } }; requestAnimationFrame(tick); }), 6000);
  const window = async (name, during) => {
    const [p0, m0] = [await procs(), await metric()];
    const [f] = await Promise.all([frames(), during?.()]);
    const [p1, m1] = [await procs(), await metric()];
    const cpu = type => +Object.keys(p1).filter(k => k.startsWith(type)).reduce((n, k) => n + (p1[k] - (p0[k] || 0)), 0).toFixed(2);
    results.push({ dpr, mode, window: name, ...f, mainThreadMs: Math.round((m1.TaskDuration - m0.TaskDuration) * 1000), gpuProcessCpuS: cpu('GPU'), rendererCpuS: cpu('renderer'), browserCpuS: cpu('browser'),
      canvas: await page.evaluate(() => { const c = document.querySelector('[data-hero-pixels] canvas'); return c ? `${c.width}x${c.height}` : 'none'; }) });
  };
  await window('idle, hero visible');
  await window('smooth scroll', async () => { for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 700); await page.waitForTimeout(500); } for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -700); await page.waitForTimeout(500); } });
  await browser.close();
}
await fs.writeFile('.artifacts/performance/ux/pixelblast-ab.json', JSON.stringify(results, null, 2));
console.table(results);
