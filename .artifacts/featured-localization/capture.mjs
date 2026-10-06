import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const phase=process.argv[2] || 'before';
const browser=await chromium.launch();
try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  for(const locale of ['en','ar']) for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===1440?900:844});
    await page.goto(`http://localhost:3000/${locale}`);
    const section=page.getByTestId('featured-case-study');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({path:`.artifacts/featured-localization/${phase}-${locale}-${width}.png`,animations:'disabled',style:'body > header, .skip-link, nextjs-portal { visibility: hidden !important; }'});
    const geometry=await section.evaluate(el=>{
      const root=el.getBoundingClientRect();
      const box=node=>{const r=node.getBoundingClientRect();return {x:r.x-root.x,y:r.y-root.y,width:r.width,height:r.height};};
      return {section:box(el),panels:[...el.firstElementChild.children].map(box),stages:[...el.querySelectorAll('ol li')].map(node=>({box:box(node),dot:{left:getComputedStyle(node,'::before').left,top:getComputedStyle(node,'::before').top},border:getComputedStyle(node).borderInlineStartWidth})),cta:box(el.querySelector('a')),overflow:document.documentElement.scrollWidth>innerWidth,text:el.innerText};
    });
    await writeFile(`.artifacts/featured-localization/${phase}-${locale}-${width}.json`,JSON.stringify(geometry,null,2));
    console.log(`${phase} ${locale} ${width} captured; overflow=${geometry.overflow}`);
  }
} finally {await browser.close();}

