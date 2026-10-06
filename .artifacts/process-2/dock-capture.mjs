import {chromium} from '@playwright/test';
const browser=await chromium.launch();
for (const locale of ['ar','en']) {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(`http://127.0.0.1:3000/${locale}/process`,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'nextjs-portal{display:none}'});
  await page.screenshot({path:`.artifacts/process-2/header-${locale}-1440.png`, clip:{x:0,y:0,width:1440,height:80}});
  await page.evaluate(()=>scrollTo({top:2400,behavior:'instant'})); await page.waitForTimeout(500);
  const clip={x:470,y:760,width:500,height:140};
  await page.screenshot({path:`.artifacts/process-2/dock-idle-${locale}.png`, clip});
  const links=page.locator('.elsheik-quick-dock a');
  await links.nth(3).hover(); await page.waitForTimeout(500);
  await page.screenshot({path:`.artifacts/process-2/dock-hover-${locale}.png`, clip});
  await links.nth(0).focus(); await page.waitForTimeout(400);
  await page.screenshot({path:`.artifacts/process-2/dock-focus-${locale}.png`, clip});
  await page.close();
}
await browser.close();
