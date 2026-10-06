import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const errors=[];
for(const locale of ['en','ar']){
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 for(const [route,name] of [['services','services'],['work/relax-moon-spa-automation','case-study'],['contact','contact']]){
  await page.goto(`http://localhost:3000/${locale}/${route}`,{waitUntil:'networkidle'});
  if(name==='contact') await page.locator('textarea').focus();
  await page.screenshot({path:`.artifacts/dock/${locale}-${name}-final.png`,style:'nextjs-portal{display:none}'});
 }
 await page.setViewportSize({width:320,height:568});await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});await page.locator('.dock-item a').nth(2).hover();await page.waitForTimeout(600);await page.screenshot({path:`.artifacts/dock/${locale}-320-final.png`,style:'nextjs-portal{display:none}'});
 await page.close();
}
await browser.close();await fs.writeFile('.artifacts/dock/browser-errors-final.json',JSON.stringify(errors));console.log(errors);
