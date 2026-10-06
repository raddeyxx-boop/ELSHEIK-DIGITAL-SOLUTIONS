import { chromium } from '@playwright/test';
const browser=await chromium.launch({args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=d3d11']});
for (const mobile of [false,true]) {
 const context=await browser.newContext({viewport:{width:mobile?390:1440,height:844},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.addInitScript(()=>{
  window.audit=[];
  for(const type of ['pointerdown','pointerup','click','pointerenter','pointerleave','focusin','focusout'])document.addEventListener(type,e=>{
   const row=e.target.closest?.('[data-service-row]');
   if(row) window.audit.push({type,tag:e.target.tagName,text:e.target.textContent.slice(0,35),row:row.dataset.serviceRow,x:e.clientX,y:e.clientY,active:row.dataset.active,scroll:scrollY});
  },true);
 });
 await page.goto('http://127.0.0.1:3130/en/services');
 const row=page.locator('[data-service-row]').first();await row.scrollIntoViewIfNeeded();
 console.log('initial',mobile,await row.boundingBox());
 if(mobile)await row.getByRole('button',{name:/Preview:/}).tap();else await row.hover({position:{x:150,y:50}});
 await page.waitForTimeout(2500);
 console.log('result',page.url(),await row.getAttribute('data-active').catch(()=>null),await page.evaluate(()=>window.audit));
 await context.close();
}
await browser.close();
