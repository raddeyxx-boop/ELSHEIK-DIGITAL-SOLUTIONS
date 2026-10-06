import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch();const results=[];
for(const route of ['services','contact']){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{window.pixelFrames=[];const draw=WebGL2RenderingContext.prototype.drawElements;WebGL2RenderingContext.prototype.drawElements=function(...args){window.pixelFrames.push(performance.now());return draw.apply(this,args);};});
 await page.goto(`http://localhost:3000/en/${route}`,{waitUntil:'networkidle'});await page.locator('[data-state="running"]').waitFor();
 const geometry=()=>page.locator('[data-pixel-hero] h1').boundingBox();
 const before=await geometry();
 await page.evaluate(()=>window.pixelFrames=[]);const a=await page.locator('[data-hero-pixels]').screenshot();await page.waitForTimeout(8000);const b=await page.locator('[data-hero-pixels]').screenshot();
 const after=await geometry();
 const rawA=await sharp(a).ensureAlpha().raw().toBuffer({resolveWithObject:true});const rawB=await sharp(b).ensureAlpha().raw().toBuffer();let changed=0;const diff=Buffer.alloc(rawB.length);
 for(let i=0;i<rawB.length;i+=4){const delta=Math.max(...[0,1,2].map(c=>Math.abs(rawA.data[i+c]-rawB[i+c])));if(delta>0)changed++;diff[i]=diff[i+1]=diff[i+2]=Math.min(255,delta*12);diff[i+3]=255;}
 await sharp(diff,{raw:rawA.info}).png().toFile(`.artifacts/pixelblast/motion-${route}-diff.png`);
 const frames=await page.evaluate(()=>window.pixelFrames);await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);const reducedCanvasCount=await page.locator('canvas[data-pixel-canvas]').count();results.push({route,viewport:'390x844',intervalMs:8000,frames:frames.length,fps:1000*(frames.length-1)/(frames.at(-1)-frames[0]),framesDiffer:changed>0,changedPixels:changed,changedPercent:100*changed/(rawA.info.width*rawA.info.height),textStable:JSON.stringify(before)===JSON.stringify(after),before,after,reducedCanvasCount});
 await fs.writeFile(`.artifacts/pixelblast/motion-${route}-a.png`,a);await fs.writeFile(`.artifacts/pixelblast/motion-${route}-b.png`,b);await page.close();
}await browser.close();await fs.writeFile('.artifacts/pixelblast/motion-results.json',JSON.stringify(results,null,2));console.log(results);
