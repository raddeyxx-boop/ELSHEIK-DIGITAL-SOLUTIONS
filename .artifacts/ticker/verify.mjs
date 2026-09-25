import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage();
const baseline=JSON.parse(await readFile('.artifacts/ticker/before.json','utf8'));const results=[];
for(const before of baseline){const {locale,width}=before;await page.setViewportSize({width,height:width===1920?1080:width===1024?768:width===768?1024:width===390?844:900});await page.goto(`http://localhost:3000/${locale}`);const section=page.locator('section[class*="positioning"]');await section.scrollIntoViewIfNeeded();
 const after=await section.evaluate(el=>{const box=n=>{const r=n.getBoundingClientRect(),base=el.getBoundingClientRect();return {x:r.x-base.x,y:r.y-base.y,width:r.width,height:r.height}};return{section:box(el),paragraph:box(el.querySelector('p')),star:box(el.querySelector('svg')),ticker:box(el.querySelector('[data-testid="editorial-ticker"]')),overflow:document.documentElement.scrollWidth>innerWidth}});
 const unchanged=['section','paragraph','star'].every(key=>JSON.stringify(before[key])===JSON.stringify(after[key]));results.push({locale,width,unchanged,...after});console.log(`${locale} ${width}: unchanged=${unchanged}, overflow=${after.overflow}`);
 if([1920,1440,1024,768,390,320].includes(width))await section.screenshot({path:`.artifacts/ticker/after-${locale}-${width}.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});
}await writeFile('.artifacts/ticker/comparison.json',JSON.stringify(results,null,2));await browser.close();
