import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=d3d11']});
const observations=[];
await mkdir('.artifacts/responsive',{recursive:true});
try {
  for(const locale of ['en','ar']) {
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    for(const route of ['', '/services']) {
      await page.goto(`http://127.0.0.1:3130/${locale}${route}`);
      await page.locator(route?'h1':'[data-testid="final-cta"]').waitFor();
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:`.artifacts/responsive/desktop-${locale}-${route?'services':'home'}.png`});
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(`http://127.0.0.1:3130/${locale}/insights`);
    console.log(locale,await page.locator('main h2').allTextContents());
    await page.screenshot({path:`.artifacts/responsive/populated-${locale}-insights.png`,fullPage:true});
    observations.push({locale,desktopScreenshots:2});
    await page.close();
  }
  await writeFile('.artifacts/responsive-extra.json',JSON.stringify(observations,null,2));
  console.log(JSON.stringify(observations));
} finally { await browser.close(); }
