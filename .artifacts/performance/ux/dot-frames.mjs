// Captures 48x48 crops of the hero packet at fixed animation times, for SMIL vs
// compositor comparison. Freezes SMIL (setCurrentTime) or WAAPI (currentTime).
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [base, name] = [process.argv[2], process.argv[3]];
const times = [0.5, 1.3, 2.3, 3.4, 4.0];
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const out = [];
for (const [w, h, locale] of [[1440, 900, 'en'], [390, 844, 'ar'], [768, 1024, 'en']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; });
  await page.goto(`${base}/${locale}`);
  const field = page.locator('[class*=system-field-module__][class*=__field]'); await field.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
  await page.addStyleTag({ content: '[class*=__module]{transition:none!important}' });
  for (const t of times) {
    const clip = await page.evaluate(async t => {
      const f = document.querySelector('[class*=system-field-module__][class*=__field]'), svg = f.querySelector(':scope > svg');
      f.querySelectorAll('[class*=__module]').forEach(m => m.classList.forEach(c => c.includes('__active') && m.classList.remove(c)));
      if (svg.querySelector('animateMotion')) { svg.pauseAnimations(); svg.setCurrentTime(t); }
      for (const a of f.getAnimations({ subtree: true })) { a.pause(); a.currentTime = t * 1000; }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const path = svg.querySelector('path'), m = svg.getScreenCTM(), at = path.getPointAtLength(path.getTotalLength() * t / 4.6);
      return { x: Math.round(m.a * at.x + m.e - 24), y: Math.round(m.d * at.y + m.f - 24) };
    }, t);
    const file = `.artifacts/performance/ux/dot-${name}-${locale}-${w}-${t}.png`;
    await page.screenshot({ path: file, clip: { ...clip, width: 48, height: 48 } }); out.push(file);
  }
  await page.close();
}
await browser.close();
await fs.writeFile(`.artifacts/performance/ux/dot-${name}.json`, JSON.stringify(out));
console.log(out.length, 'crops');
