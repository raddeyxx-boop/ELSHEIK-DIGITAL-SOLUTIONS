import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const phase=process.argv[2]||'after';
const browser=await chromium.launch();const results=[];
for(const locale of ['en','ar']){
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const [width,height] of (phase==='before'?[[1920,1080],[390,844]]:[[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]])){
  await page.setViewportSize({width,height});await page.goto(`http://localhost:3000/${locale}/about`,{waitUntil:'networkidle'});
  await page.screenshot({path:`.artifacts/about/${phase}-${locale}-${width}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});
  results.push(await page.evaluate(({locale,width,height})=>({locale,width,height,overflow:document.documentElement.scrollWidth>innerWidth,h1Size:getComputedStyle(document.querySelector('h1')).fontSize,headings:[...document.querySelectorAll('main h1,main h2')].map(e=>e.textContent)}),{locale,width,height}));
 }await page.close();
}await browser.close();await fs.writeFile(`.artifacts/about/${phase}.json`,JSON.stringify(results,null,2));console.log(`${results.length} captures; ${results.filter(r=>r.overflow).length} overflow`);
