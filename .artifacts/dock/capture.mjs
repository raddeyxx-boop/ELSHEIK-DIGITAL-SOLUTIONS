import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const errors=[];
for(const locale of ['en','ar']){
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1440,900],[1024,768],[768,1024],[430,932],[390,844],[375,812]]){
  await page.setViewportSize({width,height});await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});await page.screenshot({path:`.artifacts/dock/${locale}-${width}.png`,style:'nextjs-portal{display:none}'});
 }
 await page.locator('.dock-item a').first().focus();await page.waitForTimeout(600);await page.screenshot({path:`.artifacts/dock/${locale}-focus.png`,style:'nextjs-portal{display:none}'});
 await page.goto(`http://localhost:3000/${locale}/contact`,{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.screenshot({path:`.artifacts/dock/${locale}-footer.png`,style:'nextjs-portal{display:none}'});
 await page.close();
}
await browser.close();await fs.writeFile('.artifacts/dock/browser-errors.json',JSON.stringify(errors));console.log(errors);
