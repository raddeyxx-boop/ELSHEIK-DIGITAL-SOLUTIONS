// Diagnostic only: compares candidate fixes for the SystemField packet by editing the live DOM.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200';
const noWebgl = () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; };
const field = '[class*=system-field-module__][class*=__field]';
const variants = [
  ['current', () => {}],
  ['A: diagram svg promoted', f => { f.querySelector(':scope > svg').style.willChange = 'transform'; }],
  ['B: packet in its own promoted overlay svg', f => { const svg = f.querySelector(':scope > svg'); const overlay = svg.cloneNode(true); overlay.querySelectorAll('path').forEach(p => p.remove()); svg.querySelector('circle')?.remove(); overlay.style.willChange = 'transform'; svg.after(overlay); }],
];
const results = [];
for (const webgl of [false, true]) for (const [name, edit] of variants) {
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); if (!webgl) await page.addInitScript(noWebgl);
  const bcdp = await browser.newBrowserCDPSession();
  const cpu = async type => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo.filter(p => p.type === type).reduce((n, p) => n + p.cpuTime, 0);
  await page.goto(base + '/en'); await page.waitForLoadState('load');
  await page.evaluate(([sel, src]) => { new Function('f', `(${src})(f)`)(document.querySelector(sel)); }, [field, edit.toString()]);
  await page.waitForTimeout(2500);
  const [g0, r0] = [await cpu('GPU'), await cpu('renderer')]; await page.waitForTimeout(6000); const [g1, r1] = [await cpu('GPU'), await cpu('renderer')];
  results.push({ pixelBlast: webgl ? 'on' : 'off', variant: name, gpuProcessCpuPct: +((g1 - g0) / 6 * 100).toFixed(1), rendererCpuPct: +((r1 - r0) / 6 * 100).toFixed(1) });
  await browser.close();
}
await fs.writeFile('.artifacts/performance/ux/packet-fix-ab.json', JSON.stringify(results, null, 2));
console.table(results);
