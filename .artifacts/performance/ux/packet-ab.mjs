// Diagnostic only: isolates the cost of the hero SystemField packet (SVG SMIL
// animateMotion) with WebGL off and the ticker paused. Overrides are injected, never shipped.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200', route = process.argv[3] || '/en', label = process.argv[4] || 'packet-ab';
const noWebgl = () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; };
const common = '[class*=tickerTrack]{animation-play-state:paused!important}';
const field = '[class*=system-field-module__][class*=__field]';
const variants = [
  ['baseline (WebGL off, ticker paused)', '', null],
  ['SMIL paused (svg.pauseAnimations)', '', () => document.querySelectorAll('svg').forEach(s => s.pauseAnimations?.())],
  ['packet drop-shadow removed', '[class*=__packet]{filter:none!important}', null],
  ['field clip-path removed', `${field}{clip-path:none!important}`, null],
  ['diagram svg on its own layer', `${field}>svg{will-change:transform}`, null],
];
const results = [];
for (const [name, css, js] of variants) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await page.addInitScript(noWebgl);
  const bcdp = await browser.newBrowserCDPSession();
  const cpu = async type => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + route); await page.waitForLoadState('load'); await page.addStyleTag({ content: common + css }); if (js) await page.evaluate(js);
  await page.waitForTimeout(2500);
  const [g0, r0] = [await cpu('GPU'), await cpu('renderer')]; await page.waitForTimeout(6000); const [g1, r1] = [await cpu('GPU'), await cpu('renderer')];
  results.push({ variant: name, gpuProcessCpuPct: +((g1 - g0) / 6 * 100).toFixed(1), rendererCpuPct: +((r1 - r0) / 6 * 100).toFixed(1) });
  await browser.close();
}
await fs.writeFile(`.artifacts/performance/ux/${label}.json`, JSON.stringify(results, null, 2));
console.table(results);
