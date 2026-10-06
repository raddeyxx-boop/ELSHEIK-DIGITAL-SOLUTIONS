import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
await page.goto('http://localhost:3000/ar');const row=page.locator('[data-service-row="automation"]');await row.scrollIntoViewIfNeeded();await row.getByRole('button').click();await page.waitForTimeout(300);await row.screenshot({path:'.artifacts/services/reduced-automation-corrected-ar-320.png',style:'body header,.skip-link,nextjs-portal{visibility:hidden!important}'});await browser.close();
