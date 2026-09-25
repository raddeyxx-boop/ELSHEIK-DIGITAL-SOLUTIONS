import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const phase = process.argv[2] || 'after';
const sizes = [[1920,1080],[1728,1117],[1536,864],[1440,900],[1366,768],[1280,800],[1024,768],[768,1024],[390,844],[375,812]];
const browser = await chromium.launch({headless:true});
const results=[];
for (const locale of ['en','ar']) {
 const page=await browser.newPage({reducedMotion:'reduce'});
 for (const [width,height] of sizes) {
  await page.setViewportSize({width,height});
  await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const hero=page.getByTestId('homepage-hero');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  const style='nextjs-portal { visibility: hidden !important; }';
  await page.screenshot({path:`.artifacts/hero/${phase}-${locale}-${width}.png`,style});
  const rect=await hero.boundingBox();
  const full=await page.screenshot({fullPage:true,style});
  await sharp(full).extract({left:0,top:Math.ceil(rect.y),width,height:Math.floor(rect.height)}).toFile(`.artifacts/hero/${phase}-${locale}-${width}-hero.png`);
  const geometry=await hero.evaluate(el=>{
   const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};
   const grid=el.children[1],copy=grid.children[0],field=grid.children[1];
   return {hero:box(el),grid:box(grid),headline:box(el.querySelector('h1')),field:box(field),core:box(field.querySelector('[class*="core"]')),cta:box(copy.querySelector('[class*="actions"]')),font:getComputedStyle(el.querySelector('h1')).fontSize,overflow:document.documentElement.scrollWidth>innerWidth,modules:[...field.querySelectorAll('button')].map(box)};
  });
  results.push({locale,width,height,...geometry});
 }
 await page.close();
}
await fs.writeFile(`.artifacts/hero/${phase}-geometry.json`,JSON.stringify(results,null,2));
await browser.close();
console.log(`${phase}: ${results.length} viewport states; overflow ${results.filter(r=>r.overflow).length}`);
