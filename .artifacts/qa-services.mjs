import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.emulateMedia({reducedMotion:'reduce'});
const results=[];
for(const locale of ['en','ar']){
 for(const [width,height] of [[1440,900],[1920,1080],[1280,800],[1024,768],[430,932],[390,844],[375,812]]){
  await page.setViewportSize({width,height});
  await page.goto(`http://127.0.0.1:3000/${locale}/services`);
  const rows=page.locator('[data-service-row]');
  for(let i=0;i<6;i++){
   await page.mouse.move(0,0);
   const row=rows.nth(i);
   await row.scrollIntoViewIfNeeded();
   if(width<=900) await row.getByRole('button').click();else await row.hover();
   await page.waitForTimeout(180);
   const preview=row.locator('[data-service-preview]');
   const kind=await preview.getAttribute('data-service-preview');
   await row.screenshot({path:`.artifacts/services/cinematic-${locale}-${width}-${kind}.png`});
   results.push({locale,width,kind,row:await row.boundingBox(),preview:await preview.boundingBox(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),clipped:await preview.evaluate(el=>Array.from(el.querySelectorAll('*')).filter(n=>n instanceof HTMLElement && n.clientWidth>0 && n.scrollWidth>n.clientWidth+2).map(n=>({cls:n.className,text:n.textContent}))) });
   if(width<=900) await row.getByRole('button').click();else await page.mouse.move(0,0);
  }
 }
}
await fs.writeFile('.artifacts/services/cinematic-geometry.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.filter(r=>r.overflow||r.clipped.length),null,2));
await browser.close();
