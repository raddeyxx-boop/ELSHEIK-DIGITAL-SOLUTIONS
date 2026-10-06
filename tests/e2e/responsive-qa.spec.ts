import { test, expect } from '@playwright/test';
import { previewCopy } from '../../src/components/services/preview-content';
import { labels } from '../../src/components/case-study/operations-demo/labels';

const viewports = [[1920,1080],[1440,900],[1366,768],[1024,768],[820,1180],[768,1024],[430,932],[412,915],[390,844],[375,812],[360,800],[320,568]];
const routes = ['', 'about', 'services', 'technologies', 'work', 'insights', 'contact', 'process', 'work/relax-moon-spa-automation', 'insights/responsive-demo', 'work/responsive-demo'];
for (const locale of ['en','ar']) for (const [width,height] of viewports) {
  test(`${locale} ${width} public responsive matrix`, async ({page}, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    const errors: string[] = [], observations: unknown[] = [];
    page.on('pageerror',error=>errors.push(error.message));
    for (const route of routes) {
      await page.goto(`/${locale}/${route}`);
      await expect(page.locator('h1')).toBeVisible();
      // Home streams its CMS sections after the hero; inspect the complete page.
      if(route==='') await expect(page.getByTestId('final-cta')).toBeAttached();
      await page.evaluate(()=>document.fonts.ready);
      const geometry = await page.evaluate(()=> {
        const outside: string[]=[];
        const clipped = Array.from(document.querySelectorAll('main h1,main h2,main h3,main p,main button,main input,main select,main textarea,footer a')).flatMap(element=> {
          const node = element as HTMLElement, rect=node.getBoundingClientRect(), style=getComputedStyle(node);
          if (!rect.width || !rect.height || style.visibility==='hidden') return [];
          let contained=false;
          for(let parent=node.parentElement;parent && parent!==document.body;parent=parent.parentElement) {
            if(['auto','scroll'].includes(getComputedStyle(parent).overflowX) && parent.scrollWidth>parent.clientWidth) contained=true;
          }
          if(!contained && (rect.left < -1 || rect.right > innerWidth+1)) outside.push(`${node.tagName}: ${node.textContent?.slice(0,80)}`);
          if (node.scrollWidth>node.clientWidth+2 && style.overflowX==='visible' && node.children.length===0)
            return [{tag:node.tagName,cls:node.className,text:node.textContent?.slice(0,100),width:rect.width,scroll:node.scrollWidth}];
          return [];
        });
        return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,clipped,outside};
      });
      observations.push({route,...geometry});
      expect.soft(geometry.scroll,route).toBeLessThanOrEqual(geometry.width);
      expect.soft(geometry.clipped,route).toEqual([]);
      expect.soft(geometry.outside,route).toEqual([]);
      if(width===320 && route==='') await page.locator(`main a[href="/${locale}/work/relax-moon-spa-automation"]`).first().screenshot({path:`.artifacts/responsive/project-${locale}-320.png`});
      if(width===390) {
        // Keep each capture below the GPU texture limit; tall full-page captures
        // repeated the top of the case study after 16384px on Windows/D3D11.
        const total = await page.evaluate(()=>document.documentElement.scrollHeight);
        for(let y=0;y<total;y+=6000) await page.screenshot({path:`.artifacts/responsive/final-${locale}-${route.replaceAll('/','-')||'home'}-${y}.png`,fullPage:true,clip:{x:0,y,width,height:Math.min(6000,total-y)}});
      }
    }
    await testInfo.attach('geometry',{body:JSON.stringify(observations,null,2),contentType:'application/json'});
    expect(errors).toEqual([]);
  });
}

for(const locale of ['en','ar'] as const) for(const width of [320,360,375,390,430,820,1024]) {
  test(`${locale} ${width} usable previews, dashboard and drawer`,async({browser,baseURL})=>{
    test.setTimeout(90000);
    const context=await browser.newContext({baseURL,viewport:{width,height:844},hasTouch:true,isMobile:width<600,reducedMotion:'reduce'});
    const page=await context.newPage(), l=labels(locale);
    for(const route of ['', '/services']) {
      await page.goto(`/${locale}${route}`);
      const rows=page.locator('[data-service-row]');
      for(let i=0;i<6;i++) {
        const row=rows.nth(i);
        await row.getByRole('button',{name:new RegExp(`^${previewCopy[locale].preview}:`)}).tap();
        const scene=row.locator('[data-service-preview]');
        await expect(scene).toBeVisible();
        await expect(scene).toHaveAttribute('data-stage','4');
        const clipped = await scene.evaluate(root=>Array.from(root.querySelectorAll('strong,small,b,span')).flatMap(element=>{
          const node=element as HTMLElement, style=getComputedStyle(node);
          return node.children.length===0 && node.clientWidth>0 && Number.parseFloat(style.fontSize)>0 && node.scrollWidth>node.clientWidth+2 ? [{text:node.textContent,width:node.clientWidth,scroll:node.scrollWidth}] : [];
        }));
        expect.soft(clipped,`${route} scene ${i}`).toEqual([]);
        const cropped = await scene.evaluate(root=>{
          const box=root.getBoundingClientRect();
          return Array.from(root.children).filter(child=>child.getBoundingClientRect().bottom>box.bottom+2).map(child=>child.textContent?.slice(0,60));
        });
        expect.soft(cropped,`${route} scene ${i} height`).toEqual([]);
        if(width===390 || (width===320 && [1,5].includes(i)) || (width===820 && route && i===1) || (width===1024 && !route && i===2)) await scene.screenshot({path:`.artifacts/responsive/scene-${locale}-${route?'services':'home'}-${i}${width===390?'':'-'+width}.png`});
        await scene.tap();
        await expect(row).toHaveAttribute('data-active','true');
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        await page.keyboard.press('Escape');
        await expect(row).toHaveAttribute('data-active','false');
      }
    }
    await page.goto(`/${locale}/work/relax-moon-spa-automation`);
    const demo=page.getByTestId('operations-console');
    for(const name of [l.overview,l.bookings,l.team,l.customers,l.activity,l.analytics]) {
      await demo.getByRole('tab',{name,exact:true}).tap();
      await expect(demo.getByRole('tabpanel')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(width===390) await demo.screenshot({path:`.artifacts/responsive/dashboard-${locale}-${[l.overview,l.bookings,l.team,l.customers,l.activity,l.analytics].indexOf(name)}.png`});
    }
    await demo.getByRole('tab',{name:l.bookings,exact:true}).tap();
    await demo.getByLabel(l.search,{exact:true}).fill('DEMO-RM-009');
    await demo.getByRole('button',{name:/DEMO-RM-009/}).tap();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box=await dialog.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(width);
    expect(box!.height).toBeLessThanOrEqual(844);
    if(width===390) await page.screenshot({path:`.artifacts/responsive/drawer-${locale}.png`});
    await dialog.getByRole('button',{name:l.nextRecord,exact:true}).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('button',{name:l.nextRecord,exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await context.close();
  });
}

for(const locale of ['en','ar']) {
  test(`${locale} populated editorial controls at every requested width`,async({page})=>{
    test.setTimeout(90000);
    await page.emulateMedia({reducedMotion:'reduce'});
    // Build-time fallback pages use ISR. Verify the refreshed, read-only fixture
    // content rather than assuming the first stale response contains the index.
    await expect.poll(async()=>{
      await page.goto(`/${locale}/insights`);
      return page.getByRole('searchbox').count();
    },{timeout:65000,intervals:[1000]}).toBe(1);
    for(const [width,height] of viewports) {
      await page.setViewportSize({width,height});
      const search=page.getByRole('searchbox');
      await search.fill('NO_MATCH_QA_2026');
      const clear=page.getByRole('button',{name:locale==='en'?'Clear filters':'إلغاء التصفية',exact:true});
      await clear.click();
      await expect(search).toHaveValue('');
      const categories=page.getByRole('group',{name:locale==='en'?'Insight categories':'تصنيفات المقالات'});
      await categories.getByRole('button',{name:'Automation',exact:true}).click();
      await expect(categories.getByRole('button',{name:'Automation',exact:true})).toHaveAttribute('aria-pressed','true');
      await categories.getByRole('button',{name:locale==='en'?'All':'الكل',exact:true}).click();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(width===390) await page.screenshot({path:`.artifacts/responsive/populated-${locale}-insights.png`,fullPage:true});
    }
    for(const width of [1440,820,390,320]) {
      await page.setViewportSize({width,height:844});
      await page.goto(`/${locale}/work/responsive-demo`);
      await page.mouse.move(0,0);
      const nodes=page.locator('button').filter({has:page.locator('strong')});
      for(let index=0;index<await nodes.count();index++) {
        await nodes.nth(index).focus();
        const description=nodes.nth(index).locator('span');
        await expect(description).toHaveCSS('opacity','1');
        const crop=await description.evaluate(node=>({height:node.clientHeight,scroll:node.scrollHeight,text:node.textContent}));
        expect.soft(crop.scroll,`${width}: ${crop.text}`).toBeLessThanOrEqual(crop.height+1);
        if(width===1440 && index===3) await nodes.nth(index).screenshot({path:`.artifacts/responsive/architecture-${locale}-1440.png`});
      }
    }
  });
  test(`${locale} mobile navigation, form focus and landscape resize`,async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width:390,height:844});
    await page.goto(`/${locale}`);
    const marker=await page.evaluate(()=>{Object.assign(window,{responsiveDocument:'retained'});return document.documentElement;});
    expect(marker).toBeTruthy();
    for(const route of ['services','technologies','work','insights','about','contact','']) {
      if(route==='technologies') await page.locator(`footer a[href="/${locale}/technologies"]`).click();
      else {
        await page.locator('header button[aria-controls="mobile-nav"]').click();
        await page.locator(`#mobile-nav a[href="/${locale}${route?'/'+route:''}"]`).first().click();
      }
      await expect(page).toHaveURL(new RegExp(`/${locale}${route?'/'+route:''}/?$`));
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(()=>(window as unknown as {responsiveDocument:string}).responsiveDocument)).toBe('retained');
    }
    await page.goto(`/${locale}/contact`);
    const email=page.locator('input[name="email"]');
    await email.fill('responsive@example.invalid');
    await page.setViewportSize({width:390,height:420});
    await email.scrollIntoViewIfNeeded();
    await expect(email).toBeFocused();
    await expect(email).toBeInViewport();
    await page.setViewportSize({width:844,height:390});
    await expect(email).toHaveValue('responsive@example.invalid');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:320,height:568});
    await page.locator('form button').click();
    await expect(page.locator('form em').first()).toBeVisible();
  });
}
