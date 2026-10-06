import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const results=[];
for(const locale of ['en','ar'])for(const width of [360,390,768,1280,1440]){
const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
await page.goto('http://localhost:3200/'+locale,{waitUntil:'commit'});
await page.locator('[data-testid="homepage-hero"] h1').waitFor();
const early=await page.evaluate(()=>({time:performance.now(),hero:document.querySelector('[data-testid="homepage-hero"]').getBoundingClientRect().toJSON(),loading:!!document.querySelector('[aria-label="Loading content"]')}));
await page.waitForLoadState('load');await page.waitForTimeout(1000);
const final=await page.evaluate(()=>({hero:document.querySelector('[data-testid="homepage-hero"]').getBoundingClientRect().toJSON(),footer:document.querySelector('footer').getBoundingClientRect().toJSON(),cls:window.cls,overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('main h1,main h2')].map(e=>e.textContent),heroCount:document.querySelectorAll('[data-testid="homepage-hero"]').length,canvas:!!document.querySelector('[data-pixel-canvas]')}));
await page.screenshot({path:'.artifacts/performance/final-home-'+locale+'-'+width+'.png',fullPage:true});results.push({locale,width,early,final,errors});await page.close();
}await browser.close();await fs.writeFile('.artifacts/performance/home-responsive-final.json',JSON.stringify(results,null,2));console.log(results.map(r=>({locale:r.locale,width:r.width,cls:r.final.cls,overflow:r.final.overflow,stable:JSON.stringify(r.early.hero)===JSON.stringify(r.final.hero),errors:r.errors})));
