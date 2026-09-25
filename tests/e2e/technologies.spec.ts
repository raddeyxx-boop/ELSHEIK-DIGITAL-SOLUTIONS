import { test, expect } from '@playwright/test';

const technologies=['Next.js','React','TypeScript','Supabase','PostgreSQL','n8n','Playwright','Vercel','Next.js Server','API Routes','Server Actions','Auth','RLS','Access Control','Validation'];
const sizes=[[1920,1080],[1600,900],[1440,900],[1366,768],[1280,800],[1100,800],[1024,768],[1023,768],[901,800],[768,1024],[430,932],[390,844],[375,812],[320,568]];
for(const locale of ['en','ar']) for(const [width,height] of sizes) {
  test(`${locale} header and technology containment at 100 percent ${width}`,async({page})=>{
    await page.setViewportSize({width,height});await page.goto(`/${locale}/technologies`);
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>visualViewport!.scale)).toBe(1);
    const nav=page.locator('body > header nav').first();
    if(width>=1024){
      await expect(nav).toBeVisible();await expect(nav.locator('a')).toHaveCount(7);
      const bounds=await nav.evaluate(el=>{const parent=el.getBoundingClientRect();return [...el.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {inside:r.left>=parent.left-.5&&r.right<=parent.right+.5&&r.left>=0&&r.right<=innerWidth,width:r.width,uncovered:!!hit&&a.contains(hit)};});});
      for(const item of bounds){expect(item.inside).toBe(true);expect(item.width).toBeGreaterThan(20);expect(item.uncovered).toBe(true);}
      await expect(nav.locator('a').first()).toHaveAttribute('href',`/${locale}`);
    }else{await expect(nav).toBeHidden();await expect(page.locator('header button[aria-controls="mobile-nav"]')).toBeVisible();}
    const field=page.locator('[data-technology-field]');
    await expect(field.locator('section').locator('h2')).toHaveText(locale === 'ar'
      ? ['01التحقق','02الواجهات','03الواجهة الخلفية','04البيانات','05الأتمتة','06الأمان','07الاختبار','08البنية التحتية']
      : ['01Verification','02Frontend','03Backend','04Data','05Automation','06Security','07Testing','08Infrastructure']);
    for(const name of technologies){await expect(field.locator(`[data-technology="${name}"]`).first()).toBeVisible();await expect(field.locator(`[data-technology-icon="${name}"]`).first()).toHaveAttribute('aria-hidden','true');}
    const intro=await page.locator('main h1').boundingBox(),header=await page.locator('body > header').boundingBox();expect(intro!.y).toBeGreaterThan(header!.y+header!.height+20);
    const fieldBox=await field.boundingBox();expect(fieldBox!.height).toBeGreaterThan(400);expect(fieldBox!.width).toBeGreaterThan(270);
    const contained=await field.evaluate(el=>{const r=el.getBoundingClientRect();return [...el.querySelectorAll('[data-technology]')].every(n=>{const b=n.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom;});});expect(contained).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const name of technologies) await expect(field.locator(`[data-technology="${name}"] bdi`).first()).toHaveAttribute('dir','ltr');
  });
}

test('technology drift, hover pause, static reduced motion and local icon files',async({page,request})=>{
  await page.setViewportSize({width:1440,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/en/technologies');
  const field=page.locator('[data-technology-field]');await expect(field).toHaveAttribute('data-running','true');
  const node=field.locator('[data-technology="React"]');
  const before=await node.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(1200);const after=await node.evaluate(el=>getComputedStyle(el).transform);expect(after).not.toBe(before);
  const target=await node.boundingBox();await page.mouse.move(target!.x+target!.width/2,target!.y+target!.height/2);
  await expect(node).toHaveCSS('animation-play-state','paused');await expect(node.locator('div')).toHaveCSS('color','rgb(202, 255, 74)');
  for(const name of ['Next.js Server','Auth']) {
    const capability=field.locator(`[data-technology="${name}"]`);
    await capability.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    const box=await capability.boundingBox();
    await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
    await expect(capability).toHaveCSS('animation-play-state','paused');
    await expect(capability.locator('div')).toHaveCSS('color','rgb(202, 255, 74)');
  }
  await page.emulateMedia({reducedMotion:'reduce'});await expect(node).toHaveCSS('animation-name','none');await expect(node).toHaveCSS('transform','none');
  for(const name of ['Next.js Server','API Routes','Server Actions','Auth','RLS','Access Control','Validation']) {
    const capability=field.locator(`[data-technology="${name}"]`);
    await expect(capability).toBeVisible();await expect(capability).toHaveCSS('animation-name','none');
    await expect(capability.locator('svg')).toBeVisible();
  }
  for(const slug of ['nextdotjs','react','typescript','supabase','postgresql','n8n','playwright','vercel']){const response=await request.get(`/technology-icons/${slug}.svg`);expect(response.ok()).toBe(true);expect(await response.text()).toContain('<svg');}
  await page.locator('body > header nav a').first().click();await expect(page).toHaveURL(/\/en$/);expect(errors).toEqual([]);
});
