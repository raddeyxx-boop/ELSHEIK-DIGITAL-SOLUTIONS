import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const results=[];
for(const locale of ['en','ar']){
 const page=await browser.newPage({viewport:{width:901,height:800}});
 await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});await page.screenshot({path:`.artifacts/dock/${locale}-901-closure.png`,style:'nextjs-portal{display:none}'});
 const nav=page.locator('body > header nav').first();await nav.locator('a').first().focus();const order=[];for(let i=0;i<8;i++){order.push(await page.evaluate(()=>document.activeElement.textContent));await page.keyboard.press('Tab');}
 await page.locator('body > header .language').click();await page.waitForURL(`**/${locale==='en'?'ar':'en'}`);const active=await page.locator('body > header nav a[aria-current="page"]').getAttribute('href');
 await page.setViewportSize({width:390,height:844});await page.goto(`http://localhost:3000/${locale}/contact`,{waitUntil:'networkidle'});await page.locator('textarea').focus();await page.locator('textarea').scrollIntoViewIfNeeded();await page.screenshot({path:`.artifacts/dock/${locale}-contact-focused-closure.png`,style:'nextjs-portal{display:none}'});
 await page.goto(`http://localhost:3000/${locale}/work/relax-moon-spa-automation`,{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.screenshot({path:`.artifacts/dock/${locale}-case-footer-closure.png`,style:'nextjs-portal{display:none}'});
 results.push({locale,keyboardOrder:order,localeSwitchActive:active,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.close();
}
await browser.close();await fs.writeFile('.artifacts/dock/closure-extra-results.json',JSON.stringify(results,null,2));console.log(results);
