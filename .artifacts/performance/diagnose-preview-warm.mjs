import {chromium} from '@playwright/test';
const browser=await chromium.launch();
for(const warm of [false,true]){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto('http://127.0.0.1:3130/en/services');const row=page.locator('[data-service-row]').first();const button=row.getByRole('button',{name:/Preview:/});await row.scrollIntoViewIfNeeded();
 console.log('before',warm,await button.boundingBox());
 if(warm){await row.dispatchEvent('pointerdown',{pointerType:'touch'});await page.waitForTimeout(500);console.log('warm',await button.boundingBox());}
 await button.tap();await page.waitForTimeout(500);console.log('after',warm,page.url(),await row.count());if(await row.count())console.log(await row.getAttribute('data-active'));
 await context.close();
}
await browser.close();
