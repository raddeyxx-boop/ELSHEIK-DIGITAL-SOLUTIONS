import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({reducedMotion:'reduce'});const records=[];
for(const locale of ['en','ar'])for(const width of [1920,1440,1280,1024,430,390,375,320])for(const route of ['', '/services']){
await page.setViewportSize({width,height:900});await page.goto(`http://localhost:3000/${locale}${route}`);
const rows=page.locator(route?'section[class*="serviceDetail"]':'a[class*="serviceRow"]');
records.push({locale,width,route,rows:await rows.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,text:e.textContent}}))});
if(width===1440||width===390){await rows.first().screenshot({path:`.artifacts/services/before-${locale}-${width}-${route?'detail':'home'}.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});}
}await writeFile('.artifacts/services/before.json',JSON.stringify(records,null,2));await browser.close();
