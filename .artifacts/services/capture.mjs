import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage();
for(const locale of ['en','ar'])for(const width of [1440,390])for(const route of ['', '/services']){
await page.setViewportSize({width,height:900});await page.goto(`http://localhost:3000/${locale}${route}`);const rows=page.locator('[data-service-row]');
for(const i of [0,1,2,3,4,5]){const row=rows.nth(i);await row.scrollIntoViewIfNeeded();if(width>900)await row.hover();else await row.getByRole('button').click();await page.waitForTimeout(3100);await row.screenshot({path:`.artifacts/services/active-${locale}-${width}-${route?'detail':'home'}-${i}.png`,style:'body > header,.skip-link,nextjs-portal{visibility:hidden!important}'});}
}
await browser.close();
