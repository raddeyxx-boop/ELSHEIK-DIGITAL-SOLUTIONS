import { test, expect } from "@playwright/test";
const phrase = "DESIGN × ENGINEERING × OPERATIONS";
for (const locale of ["en", "ar"]) {
  test(`${locale} ticker preserves layout, direction, semantics and reduced motion`, async ({ page }) => {
    test.setTimeout(60000);
    for (const width of [1920,1600,1440,1280,1024,900,768,430,390,375,320]) {
      await page.emulateMedia({reducedMotion:"no-preference"});
      await page.setViewportSize({width,height:900});
      await page.goto(`/${locale}`);
      const ticker=page.getByTestId("editorial-ticker"), section=page.locator('section[class*="positioning"]');
      await ticker.scrollIntoViewIfNeeded();
      await expect(ticker).toBeVisible();
      const track=ticker.locator('[aria-hidden="true"] > i');
      await expect(track).toHaveCSS("animation-duration","24s");
      await expect(track).toHaveCSS("animation-timing-function","linear");
      await ticker.hover();
      await expect(track).toHaveCSS("animation-play-state","running");
      expect((await ticker.ariaSnapshot()).split(phrase).length-1).toBe(1);
      const before=await section.evaluate(el=>{
        const root=el.getBoundingClientRect();
        const box=(n:Element)=>{const r=n.getBoundingClientRect();return {x:r.x-root.x,y:r.y-root.y,w:r.width,h:r.height}};
        return {p:box(el.querySelector('p')!),star:box(el.querySelector('svg')!),section:{w:root.width,h:root.height}};
      });
      const dimensions=await ticker.evaluate(el=>{
        const r=el.getBoundingClientRect(),p=el.closest('section')!.querySelector('p')!.getBoundingClientRect(),star=el.closest('section')!.querySelector('svg')!.getBoundingClientRect();
        const overlaps=(a:DOMRect,b:DOMRect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
        return {paragraph:overlaps(r,p),star:overlaps(r,star),overflow:document.documentElement.scrollWidth>innerWidth};
      });
      expect(dimensions).toEqual({paragraph:false,star:false,overflow:false});
      await track.evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=0;});
      const initial=await ticker.screenshot();
      await track.evaluate(el=>{el.getAnimations()[0].currentTime=24000;});
      expect((await ticker.screenshot()).equals(initial)).toBe(true);
      await track.evaluate(el=>{el.getAnimations()[0].currentTime=1000;});
      const offset=await track.evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return {x:m.m41,y:m.m42}});
      expect(width>900?offset.y:offset.x).toBeLessThan(0);
      expect(width>900?offset.x:offset.y).toBe(0);
      await page.emulateMedia({reducedMotion:"reduce"});
      await expect(track).toHaveCSS("animation-name","none");
      await expect(ticker.locator('[aria-hidden="true"]')).toBeHidden();
      const source=ticker.locator('i').first();
      await expect(source).toHaveCSS("opacity","1");
      await expect(source).toHaveText(phrase);
      expect(await source.evaluate(el=>el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1)).toBe(true);
      const after=await section.evaluate(el=>{
        const root=el.getBoundingClientRect();
        const box=(n:Element)=>{const r=n.getBoundingClientRect();return {x:r.x-root.x,y:r.y-root.y,w:r.width,h:r.height}};
        return {p:box(el.querySelector('p')!),star:box(el.querySelector('svg')!),section:{w:root.width,h:root.height}};
      });
      expect(after).toEqual(before);
      if(width===390)await section.screenshot({path:`.artifacts/ticker/reduced-${locale}-390.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});
    }
  });
}
test("editorial ticker runs for two real complete loops", async ({ browser }) => {
  test.setTimeout(70000);
  const pages=await Promise.all([browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"}),browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"})]);
  try {
    await Promise.all(pages.map(async (page,index)=>{
      await page.goto(index===0?"http://localhost:3000/en":"http://localhost:3000/ar");
      const ticker=page.getByTestId("editorial-ticker");await ticker.scrollIntoViewIfNeeded();
      await ticker.locator('[aria-hidden="true"] > i').evaluate(el=>{
        el.setAttribute("data-loops","0");el.addEventListener("animationiteration",()=>el.setAttribute("data-loops",String(Number(el.getAttribute("data-loops"))+1)));
        const a=el.getAnimations()[0];a.currentTime=0;a.play();
      });
    }));
    for(let sample=1;sample<=4;sample++){
      await pages[0].waitForTimeout(12050);
      await Promise.all(pages.map(async(page,index)=>{
        await page.locator('section[class*="positioning"]').screenshot({path:`.artifacts/ticker/loop-${index===0?'en-desktop':'ar-mobile'}-${sample}.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});
      }));
    }
    for(const page of pages)await expect(page.getByTestId("editorial-ticker").locator('[aria-hidden="true"] > i')).toHaveAttribute("data-loops",/[2-9]/);
  }finally{await Promise.all(pages.map(page=>page.close()));}
});
