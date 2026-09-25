import { test, expect, type Page, type Locator } from '@playwright/test';
import { labels } from '../../src/components/case-study/operations-demo/labels';
test.setTimeout(90_000);

async function start(page: Page, locale: 'en' | 'ar') {
  const forbidden: string[] = [];
  await page.route('**/*', async route => {
    const request = route.request(), url = request.url();
    if (/supabase|n8n|webhook|graph\.facebook|whatsapp|googleapis|calendar\.google|sheets\.google/i.test(url) || !['GET','HEAD','OPTIONS'].includes(request.method())) {
      forbidden.push(`${request.method()} ${url}`); await route.abort();
    } else await route.continue();
  });
  page.on('websocket', socket => { if(!/^ws:\/\/(127\.0\.0\.1|localhost):\d+\/_next\//.test(socket.url())) forbidden.push(`WebSocket ${socket.url()}`); });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type()==='error') errors.push(message.text()); });
  page.on('requestfailed', request => { if(request.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`${request.url()}: ${request.failure()?.errorText}`); });
  await page.goto(`/${locale}/work/relax-moon-spa-automation`);
  const demo = page.getByTestId('operations-console');
  await expect(demo).toBeVisible();
  await demo.scrollIntoViewIfNeeded();
  return { demo, forbidden, errors };
}
async function capture(demo: Locator, name: string) {
  // An element screenshot taller than the viewport scrolls the page while a
  // text field keeps focus; Chromium then jumps back on the next focus change,
  // between pointerdown and pointerup. Capture unfocused, then restore focus.
  const focused = await demo.page().evaluateHandle(() => { const element = document.activeElement; if (element instanceof HTMLElement) element.blur(); return element; });
  await demo.screenshot({path:`.artifacts/operations-demo/${name}.png`,style:'body > header,nextjs-portal{opacity:0!important}'});
  await focused.evaluate(element => { if (element instanceof HTMLElement) element.focus({preventScroll:true}); });
  await focused.dispose();
}

for(const locale of ['en','ar'] as const) for(const width of [1440,390]) {
  test(`${locale} ${width} complete local operations workflow`, async ({page}) => {
    await page.setViewportSize({width,height:width===390?844:900});
    const {demo,forbidden,errors}=await start(page,locale), l=labels(locale);
    const tab=(name:string)=>demo.getByRole('tab',{name,exact:true});
    const shot=async(name:string)=>capture(demo,`${locale}-${width}-${name}`);
    await expect(demo.getByRole('tab')).toHaveCount(6);
    await expect(demo.getByRole('button',{name:/DEMO_READY|SPECIALIST_ASSIGNED|BOOKING_CREATED|CUSTOMER_CONFIRMED/})).toHaveCount(3);
    await expect(demo.getByTestId('metric-0')).toHaveText('16');
    await shot('overview');
    await demo.getByLabel(l.branch,{exact:true}).selectOption('riyadh');
    await expect(demo.getByTestId('metric-0')).toHaveText('08');
    await demo.getByLabel(l.branch,{exact:true}).selectOption('shq');
    await expect(demo.getByTestId('metric-0')).toHaveText('08');
    await demo.getByLabel(l.branch,{exact:true}).selectOption('all');
    await tab(l.bookings).click();
    await expect(demo.getByTestId('booking-count')).toContainText('20');
    await demo.getByLabel(l.status).selectOption('pending');
    await expect(demo.getByTestId('booking-count')).toContainText('3');
    await demo.getByLabel(l.status).selectOption('all');
    await demo.getByLabel(l.search,{exact:true}).fill('DEMO-RM-009');
    await expect(demo.getByTestId('booking-count')).toContainText('1');
    await shot('bookings');
    const record=demo.getByRole('button',{name:/DEMO-RM-009/});
    await record.click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    if(locale==='en') await page.screenshot({path:`.artifacts/operations-demo/en-${width}-details.png`});
    await dialog.getByLabel(l.choose).selectOption('s1');
    await dialog.getByRole('button',{name:l.confirmAssignment,exact:true}).click();
    await expect(dialog.locator('dd').filter({hasText:locale==='en'?'Maya Santos':'مايا سانتوس'})).toHaveCount(1);
    await dialog.getByRole('button',{name:l.confirm,exact:true}).click();
    await expect(dialog.getByRole('button',{name:l.complete,exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(record).toBeFocused();
    await tab(l.team).click();
    const specialist=demo.locator('article').filter({has:page.getByRole('heading',{name:locale==='en'?'Maya Santos':'مايا سانتوس',exact:true})});
    await specialist.getByRole('button',{name:l.inspect,exact:true}).click();
    await expect(specialist).toContainText(locale==='en'?'Omar Nadir':'عمر نادر');
    if(width===1440) await shot('team');
    await demo.getByLabel(l.availableOnly).check();
    await expect(specialist).toHaveCount(0);
    await tab(l.customers).click();
    await demo.getByRole('button',{name:l.history,exact:true}).first().click();
    await expect(demo.getByText(l.notes)).toBeVisible();
    await tab(l.activity).click();
    expect(await demo.getByRole('button',{name:/DEMO_READY|SPECIALIST_ASSIGNED|BOOKING_CREATED|CUSTOMER_CONFIRMED|BOOKING_UPDATED/}).count()).toBeGreaterThan(3);
    await demo.getByLabel(l.eventFilter).selectOption('assignments');
    await demo.getByLabel(l.eventSearch).fill('DEMO-RM-009');
    await expect(demo.getByRole('button',{name:/SPECIALIST_ASSIGNED/})).toHaveCount(1);
    if(width===1440) await shot('activity');
    await demo.getByRole('button',{name:/SPECIALIST_ASSIGNED/}).click();
    await dialog.getByRole('button',{name:l.complete,exact:true}).click();
    await dialog.getByRole('button',{name:l.close,exact:true}).click();
    await tab(l.overview).click();
    await expect(demo.getByTestId('metric-2')).toHaveText('07');
    await tab(l.analytics).click();
    await expect(demo.getByRole('heading',{name:l.byStatus,exact:true})).toBeVisible();
    if(locale==='en' && width===1440) await shot('analytics');
    await demo.getByRole('button',{name:l.reset,exact:true}).click();
    await expect(demo.getByTestId('metric-2')).toHaveText('06');
    await expect(demo.getByLabel(l.branch,{exact:true})).toHaveValue('all');
    await expect(demo.getByRole('status')).toHaveText(l.restored);
    await tab(l.overview).focus();
    await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');
    await expect(tab(l.bookings)).toBeFocused();
    await expect(tab(l.bookings)).toHaveAttribute('aria-selected','true');
    await page.emulateMedia({reducedMotion:'reduce'});
    await demo.getByLabel(l.search,{exact:true}).fill('DEMO-RM-009');
    await demo.getByRole('button',{name:/DEMO-RM-009/}).click();
    await expect(dialog.getByRole('button',{name:l.confirm,exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:l.cancel,exact:true}).click();
    await expect(dialog.getByRole('button',{name:l.confirm,exact:true})).toHaveCount(0);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(forbidden).toEqual([]);expect(errors).toEqual([]);
  });
}
for(const locale of ['en','ar'] as const) for(const [width,height] of [[1920,1080],[1366,768],[1280,800],[1024,768],[768,1024],[430,932],[375,812],[360,800]]) {
  test(`${locale} ${width} responsive sections and branch scope`, async({page})=>{
    await page.setViewportSize({width,height});
    const {demo,forbidden,errors}=await start(page,locale), l=labels(locale);
    await demo.getByLabel(l.branch,{exact:true}).selectOption('shq');
    for(const name of [l.bookings,l.team,l.customers,l.activity,l.analytics]) {
      await demo.getByRole('tab',{name,exact:true}).click();
      await expect(demo.getByRole('tabpanel')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await demo.getByRole('tab',{name:l.bookings,exact:true}).click();
    await expect(demo.getByTestId('booking-count')).toContainText('10');
    await demo.getByRole('button',{name:/DEMO-RM-002/}).click();
    await expect(page.getByRole('dialog')).toContainText(locale==='en'?'Sara Rami':'سارة رامي');
    await page.keyboard.press('Escape');
    await demo.getByRole('button',{name:/DEMO-RM-004/}).click();
    await expect(page.getByRole('dialog')).toContainText(locale==='en'?'Laila Nabil':'ليلى نبيل');
    await page.keyboard.press('Escape');
    await demo.getByLabel(l.branch,{exact:true}).selectOption('all');
    await expect(demo.getByTestId('booking-count')).toContainText('20');
    if([1280,768,360].includes(width)) await capture(demo,`${locale}-${width}-bookings`);
    expect(forbidden).toEqual([]);expect(errors).toEqual([]);
  });
}
