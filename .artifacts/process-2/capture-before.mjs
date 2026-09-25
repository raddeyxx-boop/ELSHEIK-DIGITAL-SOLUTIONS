import {chromium} from '@playwright/test';
const browser=await chromium.launch();
for(const locale of ['ar','en']) for (const w of [1440,390]) {
  const page=await browser.newPage({viewport:{width:w,height:w>900?900:844}});
  await page.goto(`http://127.0.0.1:3000/${locale}/process`,{waitUntil:'networkidle'});
  const h = await page.evaluate(()=>document.body.scrollHeight);
  await page.screenshot({path:`.artifacts/process-2/before-${locale}-${w}.png`,fullPage:true,style:'nextjs-portal{display:none}'});
  console.log(locale,w,h); await page.close();
}
await browser.close();
