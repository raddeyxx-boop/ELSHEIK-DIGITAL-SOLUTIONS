import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
const b=await chromium.launch();const records=[];const errors=[];
for(const locale of ['en','ar']){
 const p=await b.newPage({deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1920,1080],[1600,900],[1440,900],[1366,768],[1280,800],[1100,800],[1024,768],[901,800],[430,932],[390,844],[375,812],[320,568]]){
  await p.setViewportSize({width,height});await p.goto(`http://localhost:3000/${locale}/technologies`,{waitUntil:'networkidle'});
  const entry=await p.evaluate(()=>{const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};const header=document.querySelector('body > header'),nav=header.querySelector('nav'),links=nav.querySelectorAll('a');return {scale:visualViewport.scale,viewport:innerWidth,logo:box(header.querySelector('a')),nav:box(nav),home:box(links[0]),services:box(links[1]),contact:box(links[5]),language:box(header.querySelector('.language')),cta:box(header.querySelector('.button-primary')),field:box(document.querySelector('[data-technology-field]')),overflow:document.documentElement.scrollWidth>innerWidth};});records.push({locale,width,...entry});
  if([1440,1366,1100,1024,390,320].includes(width))await p.screenshot({path:`.artifacts/technologies/${locale}-${width}.png`,style:'nextjs-portal{display:none}'});
  if([1440,1024,390].includes(width))await p.locator('[data-technology-field]').screenshot({path:`.artifacts/technologies/${locale}-field-${width}.png`,style:'nextjs-portal{display:none} body > header{visibility:hidden} .elsheik-mobile-dock{visibility:hidden}'});
 }
 await p.close();
}
await b.close();await fs.writeFile('.artifacts/technologies/geometry-final.json',JSON.stringify({records,errors},null,2));console.log({count:records.length,errors});
