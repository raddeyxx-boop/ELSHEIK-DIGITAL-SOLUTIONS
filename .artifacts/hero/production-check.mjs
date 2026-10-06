import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const expected=JSON.parse(await fs.readFile('.artifacts/hero/after-geometry.json','utf8'));
for(const locale of ['en','ar'])for(const [width,height] of [[1920,1080],[1366,768],[390,844]]){
 await page.setViewportSize({width,height});await page.goto(`http://localhost:3001/${locale}`,{waitUntil:'networkidle'});
 const hero=page.getByTestId('homepage-hero');const r=await hero.boundingBox();const e=expected.find(x=>x.locale===locale&&x.width===width);assert(Math.abs(r.height-e.hero.height)<1);
 assert.equal(await hero.locator('circle[class*="packet"]').count(),0);
 await page.screenshot({path:`.artifacts/hero/production-${locale}-${width}.png`});
}
assert.deepEqual(errors,[]);await browser.close();console.log('6 production viewport checks passed; reduced-motion initial render clean; zero browser errors');
