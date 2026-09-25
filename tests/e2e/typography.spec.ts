import {test,expect} from '@playwright/test';

for(const locale of ['en','ar'])for(const width of [1920,1600,1440,1366,1280,1024,768,430,390,375]){
 test(`Public display ${locale} at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width<=430?844:900});
  for(const route of ['services','work','contact','work/relax-moon-spa-automation']){
   await page.goto(`/${locale}/${route}`);
   const heading=page.locator('main h1');await expect(heading).toHaveCount(1);
   const geometry=await heading.evaluate(e=>{const r=e.getBoundingClientRect(),p=e.parentElement!.getBoundingClientRect(),s=getComputedStyle(e);return {size:parseFloat(s.fontSize),left:r.left,right:r.right,top:r.top,bottom:r.bottom,parentTop:p.top,parentBottom:p.bottom,overflow:document.documentElement.scrollWidth>innerWidth,textOverflow:e.scrollWidth>e.clientWidth+1};});
   expect(geometry.size).toBeLessThanOrEqual(locale==='ar'?136:144);
   expect(geometry.size).toBeGreaterThanOrEqual(42);
   expect(geometry.left).toBeGreaterThanOrEqual(0);expect(geometry.right).toBeLessThanOrEqual(width);
   expect(geometry.top).toBeGreaterThanOrEqual(geometry.parentTop-1);expect(geometry.bottom).toBeLessThanOrEqual(geometry.parentBottom+1);
   expect(geometry.overflow).toBe(false);expect(geometry.textOverflow).toBe(false);
   await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
  }
 });
}
