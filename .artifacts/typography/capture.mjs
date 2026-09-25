import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const phase=process.argv[2]||'after';
const sizes=phase==='before'?[[1920,1080],[390,844]]:[[1920,1080],[1600,1000],[1440,900],[1366,768],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[375,812]];
const browser=await chromium.launch();const rows=[];
for(const locale of ['en','ar']){
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const route of ['','work','services','about','insights','contact','work/relax-moon-spa-automation'])for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await page.goto(`http://localhost:3000/${locale}/${route}`,{waitUntil:'networkidle'});
  const key=route.replaceAll('/','-')||'home';
  await page.screenshot({path:`.artifacts/typography/${phase}-${locale}-${key}-${width}.png`,style:'nextjs-portal{visibility:hidden}'});
  const data=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('main h1,main h2')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:e.textContent,font:s.fontSize,line:s.lineHeight,width:r.width,height:r.height,x:r.x,right:r.right,scroll:e.scrollWidth,client:e.clientWidth}}),body:[...document.querySelectorAll('main p,nav a,main .button,main h3')].map(e=>({text:e.textContent,font:getComputedStyle(e).fontSize}))}));
  rows.push({locale,route,width,height,...data});
  if(!route && [1920,390].includes(width)){
   const sections=page.locator('main section').filter({has:page.locator('h2')});
   for(let i=0;i<await sections.count();i++){const h=sections.nth(i).locator('h2').first();await h.scrollIntoViewIfNeeded();await page.screenshot({path:`.artifacts/typography/${phase}-${locale}-home-section${i}-${width}.png`,style:'nextjs-portal{visibility:hidden}'});}
  }
 }await page.close();
}await browser.close();await fs.writeFile(`.artifacts/typography/${phase}.json`,JSON.stringify(rows,null,2));console.log(`${rows.length} states; overflow: ${rows.filter(r=>r.overflow).length}`);
