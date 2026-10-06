import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:3130/en/services');await page.waitForTimeout(1000);
const scripts=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.endsWith('.js')).map(e=>e.name));
for(const url of scripts){const text=await (await page.request.get(url)).text();if(text.includes('data-service-preview')) console.log('SCENE DOWNLOADED',new URL(url).pathname,text.length);}
await browser.close();
