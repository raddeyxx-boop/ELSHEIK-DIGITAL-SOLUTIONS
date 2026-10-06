import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:3000/en/services');
await page.locator('[data-service-row]').nth(2).hover();
await page.waitForTimeout(4200);
await page.locator('[data-service-row]').nth(2).screenshot({path:'.artifacts/services/cinematic-first-mobile.png'});
console.log(await page.locator('[data-service-row]').nth(2).boundingBox());
await browser.close();
