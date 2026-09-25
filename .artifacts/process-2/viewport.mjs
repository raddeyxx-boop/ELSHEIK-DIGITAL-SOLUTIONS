import {chromium} from '@playwright/test';
// Viewport screenshots scrolled to each process section (real fixed-element rendering).
const [,, tag='vp', locale='ar', w='1440', only=''] = process.argv;
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:+w,height:+w>900?900:844}});
await page.goto(`http://127.0.0.1:3000/${locale}/process`,{waitUntil:'networkidle'});
await page.addStyleTag({content:'nextjs-portal{display:none}'});
const n = await page.locator('main section').count();
for (let i=0;i<n;i++) {
  if (only && !only.split(',').includes(String(i))) continue;
  await page.locator('main section').nth(i).evaluate(el => window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 72, behavior:'instant'}));
  await page.waitForTimeout(450);
  await page.screenshot({path:`.artifacts/process-2/${tag}-${locale}-${w}-${String(i).padStart(2,'0')}.png`});
}
console.log(n); await browser.close();
