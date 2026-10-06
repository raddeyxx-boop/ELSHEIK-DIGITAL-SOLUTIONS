import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(); const page=await browser.newPage({reducedMotion:'reduce'});
const records=[];
for(const locale of ['en','ar']) for(const width of [1920,1600,1440,1280,1024,768,430,390,375,320]){
 await page.setViewportSize({width,height:width===768?1024:width===390?844:900});await page.goto(`http://localhost:3000/${locale}`);
 const section=page.locator('section[class*="positioning"]');await section.scrollIntoViewIfNeeded();
 records.push(await section.evaluate((el,args)=>{const box=n=>{const r=n.getBoundingClientRect(),base=el.getBoundingClientRect();return {x:r.x-base.x,y:r.y-base.y,width:r.width,height:r.height}};return {...args,section:box(el),paragraph:box(el.querySelector('p')),star:box(el.querySelector('svg')),label:box(el.querySelector('span'))}}, {locale,width}));
 if([1440,390,320].includes(width))await section.screenshot({path:`.artifacts/ticker/before-${locale}-${width}.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});
}await writeFile('.artifacts/ticker/before.json',JSON.stringify(records,null,2));await browser.close();
