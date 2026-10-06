import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});const results=[];const sets={};
for(const mode of ['reduce','no-preference']){
 const page=await browser.newPage({reducedMotion:mode,viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const files=new Map();page.on('response',async r=>{if(r.url().includes('/_next/static/')&&r.url().endsWith('.js'))try{const b=await r.body();files.set(new URL(r.url()).pathname,{bytes:b.length,gzip:gzipSync(b).length});}catch{}});
 await page.goto('http://localhost:3001/en/services',{waitUntil:'networkidle'});
 if(mode==='no-preference')await page.locator('[data-state="running"]').waitFor();
 await page.waitForTimeout(1000);sets[mode]=Object.fromEntries(files);
 results.push({mode,errors,canvases:await page.locator('[data-pixel-canvas]').count()});
 await page.screenshot({path:`.artifacts/pixelblast/production-${mode}.png`});await page.close();
}
const extra=Object.entries(sets['no-preference']).filter(([key])=>!sets.reduce[key]);
const result={results,deferredChunks:extra,deferredBytes:extra.reduce((n,[,v])=>n+v.bytes,0),deferredGzipBytes:extra.reduce((n,[,v])=>n+v.gzip,0)};
await fs.writeFile('.artifacts/pixelblast/production-results.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
