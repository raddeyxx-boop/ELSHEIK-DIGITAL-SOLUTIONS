import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
const errors=[]; const rows=[];
for(const locale of ['en','ar']) {
 const page=await browser.newPage(); page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/WebGL.*warning|THREE.*warn/i.test(m.text()))errors.push(m.text());});
 for(const [route,preset] of [['','home'],['services','services'],['work','work'],['about','about'],['insights','insights'],['contact','contact'],['work/relax-moon-spa-automation','caseStudy']]) {
  for(const [width,height] of (process.argv.includes('quick')?[[1440,900]]:process.argv.includes('responsive')?[[390,844],[430,932],[375,812]]:[[1440,900],[390,844],[1920,1080],[1600,900],[1366,768],[1280,800],[1024,768],[768,1024],[430,932],[375,812]])) {
   await page.setViewportSize({width,height});await page.goto(`${process.env.QA_BASE || "http://localhost:3000"}/${locale}/${route}`,{waitUntil:'networkidle'});
   await page.locator('[data-pixel-engine][data-state="running"]').waitFor({timeout:60000});await page.waitForTimeout(400);
   await page.screenshot({path:`.artifacts/pixelblast/${locale}-${preset}-${width}.png`,style:'nextjs-portal{display:none}'});
   if(preset==='home'&&width===390) await page.locator('[data-pixel-hero]').screenshot({path:`.artifacts/pixelblast/${locale}-home-mobile-full-hero.png`,style:'nextjs-portal{display:none}'});
   rows.push({locale,preset,width,...await page.evaluate(()=>({canvas:document.querySelectorAll('[data-pixel-canvas]').length,overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1')?.textContent}))});
  }
 } await page.close();
}
await browser.close(); await fs.writeFile(`.artifacts/pixelblast/capture-results${process.argv.includes('responsive')?'-responsive':''}.json`,JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({states:rows.length,errors}));
