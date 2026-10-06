import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:3100/en/process');
const s = page.locator('section[aria-labelledby="process-model"]');
await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(5500);
const t0 = Date.now();
await s.getByRole('button', { name: 'Run: verification fails' }).click();
const samples = [];
for (let i = 0; i < 16; i++) {
  samples.push(await s.evaluate(el => ({ t: 0, active: el.querySelector('ol li[data-state="active"] bdi')?.textContent, verify: el.querySelector('ol li[data-verify]')?.dataset.result, branch: el.querySelector('[data-branch]') ? 'branch' : '', chips: [...el.querySelectorAll('ul li[data-state]')].map(l => l.querySelector('bdi').textContent + ':' + l.dataset.state).join(' '), readout: el.querySelector('[class*="modelReadout"] > div:first-child')?.textContent.slice(0, 60) })));
  samples.at(-1).t = Date.now() - t0;
  if (i === 6) await s.screenshot({ path: '.artifacts/refinement/after/en-1440-04-failure-branch.png', style: 'body>header,.skip-link{opacity:0!important}' });
  await page.waitForTimeout(400);
}
for (const x of samples) console.log(x.t, x.active, x.verify, x.branch, '|', x.chips, '|', x.readout);
await browser.close();
