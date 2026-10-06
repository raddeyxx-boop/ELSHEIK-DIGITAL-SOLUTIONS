import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch();const results=[];
for(const [route,width,height] of [['/en',1440,900],['/en/contact',1440,900],['/en',390,844],['/ar/contact',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.addInitScript(()=>{
  window.audit={lcp:0,lcpElement:'',cls:0,longTasks:[],shifts:[]};
  new PerformanceObserver(list=>{for(const e of list.getEntries()){window.audit.lcp=e.startTime;window.audit.lcpElement=e.element?.tagName+': '+e.element?.textContent?.slice(0,100);}}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){window.audit.cls+=e.value;window.audit.shifts.push({value:e.value,time:e.startTime,sources:e.sources.map(s=>({tag:s.node?.tagName,classes:s.node?.className,before:s.previousRect,after:s.currentRect}))});}}).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.audit.longTasks.push(e.duration);}).observe({type:'longtask',buffered:true});
 });
 await page.goto('http://localhost:3200'+route);await page.waitForTimeout(2500);
 const data=await page.evaluate(()=>({ ...window.audit,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,responseEnd:performance.getEntriesByType('navigation')[0].responseEnd,ttfb:performance.getEntriesByType('navigation')[0].responseStart,resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),type:r.initiatorType,bytes:r.encodedBodySize,decoded:r.decodedBodySize})),overflow:document.documentElement.scrollWidth>innerWidth,canvas:!!document.querySelector('[data-pixel-canvas]')}));
 results.push({route,width,...data});await page.close();
}
await browser.close();await fs.writeFile(`.artifacts/performance/${process.argv[2]}.json`,JSON.stringify(results,null,2));
console.log(results.map(r=>({route:r.route,width:r.width,lcp:r.lcp,cls:r.cls,js:r.resources.filter(x=>x.type==='script').reduce((n,x)=>n+x.bytes,0)})));
