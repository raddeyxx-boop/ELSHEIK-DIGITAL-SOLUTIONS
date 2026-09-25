import {chromium} from '@playwright/test';
const [,, tag='v1', ...widths] = process.argv;
const ws = widths.length ? widths.map(Number) : [1440,390];
const browser=await chromium.launch(); const errors=[];
for(const locale of ['ar','en']) for (const w of ws) {
  const page=await browser.newPage({viewport:{width:w,height:w>900?900:844}});
  page.on('console', m => { if (m.type()==='error') errors.push(`${locale}-${w}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${locale}-${w}: ${e.message}`));
  await page.goto(`http://127.0.0.1:3000/${locale}/process`,{waitUntil:'networkidle'});
  const info = await page.evaluate(()=>({h:document.body.scrollHeight, overflow: document.documentElement.scrollWidth>innerWidth}));
  await page.screenshot({path:`.artifacts/process-2/${tag}-${locale}-${w}.png`,fullPage:true,style:'nextjs-portal{display:none}'});
  console.log(locale,w,JSON.stringify(info)); await page.close();
}
console.log('errors', JSON.stringify(errors)); await browser.close();
