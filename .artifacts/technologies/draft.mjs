import {chromium} from '@playwright/test';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});for(const locale of ['en','ar']){await p.goto(`http://localhost:3000/${locale}/technologies`,{waitUntil:'networkidle'});console.log(locale,await p.locator('[data-technology-field]').innerText());await p.screenshot({path:`.artifacts/technologies/draft-${locale}.png`,style:'nextjs-portal{display:none}'});}await b.close();

