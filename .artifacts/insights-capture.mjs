import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser=await chromium.launch();
try {
  const page=await browser.newPage();
  for(const kind of ['populated','detail']) for(const locale of ['en','ar']) for(const width of [1920,1440,1024,768,430,390,375,320]) {
    await page.setViewportSize({width,height:width>768?900:844});
    await page.goto(pathToFileURL(resolve(`.artifacts/insights/${locale}-${kind}-fixture.html`)).href);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    console.log(`${kind} ${locale} ${width}: ${overflow?'OVERFLOW':'PASS'}`);
    if([1440,390].includes(width))await page.screenshot({path:`.artifacts/insights/${locale}-${kind}-fixture-${width}.png`,fullPage:true});
  }
}finally{await browser.close();}

