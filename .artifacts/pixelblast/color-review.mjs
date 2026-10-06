import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const rows=[];
for(const locale of ['en','ar'])for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
 await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});
 const sections=page.locator('main > section');
 for(let i=0;i<await sections.count();i++){
  await sections.nth(i).scrollIntoViewIfNeeded();
  await page.screenshot({path:`.artifacts/pixelblast/scroll-${locale}-${width}-${i}.png`,style:'nextjs-portal{display:none}'});
 }
 for(const [key,selector] of [['field-notes','section:has-text("05 / FIELD NOTES")'],['next-move','[data-testid="final-cta"]']]){
  const section=page.locator(selector);await section.screenshot({path:`.artifacts/pixelblast/${locale}-${key}-${width}.png`,style:'nextjs-portal,body > header{visibility:hidden}'});
  rows.push({locale,width,key,...await section.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,title:el.querySelector('h2')?.textContent,headingFont:getComputedStyle(el.querySelector('h2')).fontSize,overflow:document.documentElement.scrollWidth>innerWidth}))});
 }
 await page.close();
}await browser.close();await fs.writeFile('.artifacts/pixelblast/color-results.json',JSON.stringify(rows,null,2));console.log(rows);
