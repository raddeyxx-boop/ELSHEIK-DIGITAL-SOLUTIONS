import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.emulateMedia({reducedMotion:'reduce'});
const results=JSON.parse(await fs.readFile('.artifacts/services/cinematic-geometry.json','utf8'));
let count=0;
for(const locale of ['en','ar']) for(const [width,height] of [[1920,1080],[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[375,812]]){
 await page.setViewportSize({width,height});
 await page.goto(`http://127.0.0.1:3000/${locale}/services`);
 const rows=page.locator('[data-service-row]');
 for(let i=0;i<6;i++){
  if(i!==2)continue;
  await page.mouse.move(0,0);
  const row=rows.nth(i);
  await row.scrollIntoViewIfNeeded();
  if(width<=900)await row.getByRole('button').click(); else await row.hover();
  const preview=row.locator('[data-service-preview]');
  await preview.waitFor({state:'visible'});
  const kind=await preview.getAttribute('data-service-preview');
  await row.screenshot({path:`.artifacts/services/cinematic-${locale}-${width}-${kind}.png`,style:'nextjs-portal { visibility:hidden!important }'});
  const bounds=await preview.boundingBox();
  const scene=await preview.locator(':scope > div').last().boundingBox();
  const r={locale,width,kind,row:await row.boundingBox(),preview:bounds,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),sceneClipped:scene.y+scene.height>bounds.y+bounds.height+1};
  const idx=results.findIndex(old=>old.locale===locale&&old.width===width&&old.kind===kind);
  if(idx>=0)results[idx]=r;else results.push(r);
  count++;
  if(width<=900)await row.getByRole('button').click();else await page.mouse.move(0,0);
 }
}
await fs.writeFile('.artifacts/services/cinematic-geometry.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({recaptured:count,failures:results.filter(r=>r.overflow||r.sceneClipped)},null,2));
await browser.close();


