import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:1});const rows=[];
for(const locale of ['en','ar'])for(const width of [1920,1600,1440,1366,1280,1100,1024,901]){
 await p.setViewportSize({width,height:900});await p.goto(`http://localhost:3000/${locale}`,{waitUntil:'networkidle'});
 rows.push({locale,width,...await p.locator('body > header nav a').first().evaluate(a=>{const r=a.getBoundingClientRect(),s=a.querySelector('svg'),sr=s.getBoundingClientRect();return {label:a.textContent,href:a.getAttribute('href'),active:a.getAttribute('aria-current'),visible:a.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),icon:{width:sr.width,height:sr.height,stroke:getComputedStyle(s).stroke,visibility:getComputedStyle(s).visibility},zoom:visualViewport.scale};})});
 if(width===1440)await p.locator('body > header').screenshot({path:`.artifacts/technologies/${locale}-homepage-header.png`});
}await fs.writeFile('.artifacts/technologies/homepage-header.json',JSON.stringify(rows,null,2));console.log(rows);await b.close();
