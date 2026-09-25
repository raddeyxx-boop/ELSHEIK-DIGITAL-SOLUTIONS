import {chromium} from '@playwright/test';
const [,, tag='s1', locale='ar', w='1440'] = process.argv;
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:+w,height:+w>900?900:844}});
await page.goto(`http://127.0.0.1:3000/${locale}/process`,{waitUntil:'networkidle'});
await page.addStyleTag({content:'nextjs-portal{display:none}'});
const els = await page.locator('main > header, main section').all();
let i=0; for (const el of els) { await el.screenshot({path:`.artifacts/process-2/${tag}-${locale}-${w}-${String(i++).padStart(2,'0')}.png`, animations:'disabled'}); }
console.log(i,'sections'); await browser.close();
