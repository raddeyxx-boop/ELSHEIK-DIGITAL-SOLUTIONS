// Arabic typography audit. For every rendered element whose own text contains Arabic,
// asks Chrome which platform font actually drew it (CSS.getPlatformFontsForNode) and
// records letter-spacing applied to Arabic text. Usage: node type-audit.mjs <label> [width]
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const label = process.argv[2] || 'run', base = 'http://localhost:3200';
const width = Number(process.argv[3] || 1440);
const paths = ['', 'work', 'work/relax-moon-spa-automation', 'insights', 'technologies', 'services', 'about', 'contact', 'process', 'does-not-exist'];
const browser = await chromium.launch();
const report = { pages: [], offenders: {}, spacing: {} };
for (const path of paths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const cdp = await page.context().newCDPSession(page);
  await page.goto(`${base}/ar/${path}`); await page.waitForLoadState('load'); await page.evaluate(() => document.fonts.ready);
  const count = await page.evaluate(() => {
    let i = 0;
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
      if (/[؀-ۿ]/.test(own)) el.setAttribute('data-ar-audit', String(i++));
    }
    return i;
  });
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  let tajawal = 0, other = 0, skipped = 0;
  for (let i = 0; i < count; i++) {
    let fonts, info;
    try {
      const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-ar-audit="${i}"]` });
      ({ fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }));
      info = await page.evaluate(i => {
        const el = document.querySelector(`[data-ar-audit="${i}"]`), s = getComputedStyle(el);
        const cls = (el.getAttribute('class') || '').split(' ').filter(Boolean).map(c => c.replace(/^[a-z0-9-]+-module__[A-Za-z0-9_-]+__/, '')).join('.');
        return { tag: el.tagName, key: `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`, ls: s.letterSpacing, family: s.fontFamily.slice(0, 40), sample: el.textContent.trim().slice(0, 30), rendered: el.getClientRects().length > 0 && s.visibility !== 'hidden' };
      }, i);
    } catch { skipped++; continue; }
    if (!info.rendered || ['SCRIPT', 'TITLE', 'OPTION', 'STYLE'].includes(info.tag)) { skipped++; continue; }
    const used = fonts.filter(f => f.glyphCount > 0).sort((a, b) => b.glyphCount - a.glyphCount)[0]?.familyName || 'none';
    if (/tajawal/i.test(used)) tajawal++;
    else { other++; (report.offenders[`${used} :: ${info.key}`] ??= { path, sample: info.sample, family: info.family, count: 0 }).count++; }
    if (info.ls !== 'normal' && info.ls !== '0px') (report.spacing[`${info.key} (${info.ls})`] ??= { path, sample: info.sample, count: 0 }).count++;
  }
  report.pages.push({ path: `/ar/${path}`, arabicTextElements: count, renderedInTajawal: tajawal, notTajawal: other, skippedNotRendered: skipped });
  await page.close();
}
await browser.close();
await fs.writeFile(`.artifacts/content/type-audit-${label}.json`, JSON.stringify(report, null, 2));
console.table(report.pages);
console.log('NOT TAJAWAL (font :: element):'); for (const [k, v] of Object.entries(report.offenders)) console.log(' ', k, JSON.stringify(v));
console.log('LETTER-SPACING ON ARABIC TEXT:'); for (const [k, v] of Object.entries(report.spacing)) console.log(' ', k, JSON.stringify(v));
