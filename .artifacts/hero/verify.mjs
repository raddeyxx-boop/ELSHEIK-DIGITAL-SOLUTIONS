import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1366,height:768}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];
for(const locale of ['en','ar']){
 await page.goto(`${process.env.HERO_BASE_URL || 'http://localhost:3000'}/${locale}`,{waitUntil:'networkidle'});
 const hero=page.getByTestId('homepage-hero');
 assert.equal(await hero.locator('h1').count(),1);
 const links=hero.locator('a');
 assert.deepEqual(await links.evaluateAll(els=>els.map(e=>e.getAttribute('href'))),[`/${locale}/contact`,`/${locale}/work`]);
 for(const link of await links.all()) {await link.focus();assert(await link.evaluate(e=>e===document.activeElement && getComputedStyle(e).outlineStyle!=='none'));}
 const modules=hero.locator('button');
 for(const button of await modules.all()) {await button.focus();assert(await button.evaluate(e=>e.className.includes('active')&&getComputedStyle(e).outlineStyle!=='none'));}
 const dot=hero.locator('circle[class*="packet"]');
 const position=()=>dot.evaluate(e=>{const r=e.getBoundingClientRect();return [r.x,r.y]});
 const a=await position();await page.waitForTimeout(500);const b=await position();assert.notDeepEqual(a,b);
 await modules.nth(0).hover();assert(await modules.nth(0).evaluate(e=>e.className.includes('active')));
 await page.waitForTimeout(1900);assert(!(await modules.nth(0).evaluate(e=>e.className.includes('active'))));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 assert.equal(await dot.count(),0);
 const active=await modules.evaluateAll(es=>es.findIndex(e=>e.className.includes('active')));await page.waitForTimeout(1800);
 assert.equal(await modules.evaluateAll(es=>es.findIndex(e=>e.className.includes('active'))),active);
 await page.emulateMedia({reducedMotion:'no-preference'});
 checks.push(`${locale}: semantic heading, CTA destinations, keyboard/focus, module hover, ambient signal, module cycle, reduced motion passed`);
}
assert.deepEqual(errors,[]);
await fs.writeFile('.artifacts/hero/interaction-results.json',JSON.stringify({checks,errors},null,2));
console.log(checks.join('\n'));
await browser.close();
