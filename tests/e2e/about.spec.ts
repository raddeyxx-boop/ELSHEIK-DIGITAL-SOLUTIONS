import { test, expect } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  for (const [width,height] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844]]) {
    test(`About ${locale} content, flow and containment at ${width}`, async ({page}) => {
      await page.setViewportSize({width,height});
      await page.goto(`/${locale}/about`);
      const about=page.getByTestId("about-page");
      await expect(about.locator("h1")).toHaveCount(1);
      await expect(about.locator("h1")).toContainText(locale==="en"?"Engineering discipline.":"انضباط هندسي.");
      await expect(page.locator("html")).toHaveAttribute("dir",locale==="ar"?"rtl":"ltr");
      await expect(about).toContainText("ELSHEIK DIGITAL SOLUTIONS");
      await expect(page.getByTestId("about-principles").locator("article")).toHaveCount(3);
      await expect(page.getByTestId("about-build").locator("article")).toHaveCount(6);
      for(const id of ["about-thinking","about-automation","about-engineering","about-process","about-cta"]) await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.getByTestId("about-process").locator("li")).toHaveCount(6);
      const flow=page.getByTestId("about-flow");
      await expect(flow.locator("li")).toHaveCount(6);
      const boxes=await flow.locator("li").evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y}}));
      if(width<=800) expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
      else if(locale==="ar") expect(boxes[1].x).toBeLessThan(boxes[0].x);
      else expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
      const overflow=await about.evaluate(el=>{
        const outside=[...el.querySelectorAll('h1,h2,h3,p,article,li,a,svg')].filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right>innerWidth+1 || (e.matches('h1,h2,h3,p') && e.scrollWidth>e.clientWidth+1);});
        return {page:document.documentElement.scrollWidth>innerWidth,items:outside.map(e=>e.textContent)};
      });
      expect(overflow).toEqual({page:false,items:[]});
      const links=page.getByTestId("about-cta").locator("a");
      await expect(links.nth(0)).toHaveAttribute("href",`/${locale}/contact`);
      await expect(links.nth(1)).toHaveAttribute("href",`/${locale}/work`);
      for(const link of await links.all()) {await link.focus();await expect(link).toBeFocused();expect(await link.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe("none");}
    });
  }
}
