import { test, expect, type Page } from '@playwright/test';

declare global { interface Window { pixelAudit: { contexts: WebGL2RenderingContext[]; draws: number; ripple: boolean } } }
async function instrument(page: Page) {
  await page.addInitScript(() => {
    window.pixelAudit = { contexts: [], draws: 0, ripple: false };
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      if (args[0] === 'webgl2' && result && !window.pixelAudit.contexts.includes(result as WebGL2RenderingContext)) window.pixelAudit.contexts.push(result as WebGL2RenderingContext);
      return result;
    } as typeof original;
    const draw = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) { window.pixelAudit.draws++; return draw.apply(this, args); };
    const uniform = WebGL2RenderingContext.prototype.uniform2fv;
    WebGL2RenderingContext.prototype.uniform2fv = function (...args) {
      const value = Array.from(args[1]);
      if (value.length === 20 && value[0] >= 0) window.pixelAudit.ripple = true;
      return uniform.apply(this, args);
    };
  });
}
async function running(page: Page, preset: string) {
  await expect(page.locator('[data-hero-pixels]')).toHaveAttribute('data-hero-pixels', preset);
  await expect(page.locator('[data-pixel-engine]')).toHaveAttribute('data-state', 'running', { timeout: 30000 });
  await expect(page.locator('[data-pixel-canvas]')).toHaveCount(1);
}

for (const locale of ['en','ar']) for (const width of [1440,390]) {
  test(`${locale} ${width}: presets, decorative canvas and preserved content`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const errors: string[]=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'||/WebGL.*warning|THREE.*warn/i.test(message.text()))errors.push(message.text());});
    for(const [route,preset] of [['','home'],['services','services'],['work','work'],['about','about'],['insights','insights'],['contact','contact'],['work/relax-moon-spa-automation','caseStudy']]) {
      await page.goto(`/${locale}/${route}`); await running(page,preset);
      await expect(page.locator('[data-hero-pixels]')).toHaveAttribute('aria-hidden','true');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      expect(await page.locator('[data-hero-pixels]').evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
      const ratio=await page.locator('canvas[data-pixel-canvas]').evaluate(el=>(el as HTMLCanvasElement).width/el.getBoundingClientRect().width);
      expect(ratio).toBeLessThanOrEqual(width===390?1.01:1.51);
    }
    expect(errors).toEqual([]);
  });
}

test('route and locale transitions release every previous context', async ({page})=>{
  test.setTimeout(120000); await instrument(page); await page.goto('/en'); await running(page,'home');
  for(const route of ['services','work','about','insights','contact']) {
    await page.locator(`body > header a[href="/en${route?'/'+route:''}"]`).first().click();
    await running(page,route||'home');
    await expect.poll(()=>page.evaluate(()=>window.pixelAudit.contexts.filter(gl=>!gl.isContextLost()).length)).toBe(1);
  }
  // Reach the case study through its real public Work link, then return Home.
  await page.locator('body > header a[href="/en/work"]').first().click();await running(page,'work');
  await page.locator('a[href="/en/work/relax-moon-spa-automation"]').first().click();await running(page,'caseStudy');
  await expect.poll(()=>page.evaluate(()=>window.pixelAudit.contexts.filter(gl=>!gl.isContextLost()).length)).toBe(1);
  await page.locator('body > header a[href="/en"]').first().click();await running(page,'home');
  await page.locator('body > header a[href="/ar"]').click();await running(page,'home');
  await expect.poll(()=>page.evaluate(()=>window.pixelAudit.contexts.filter(gl=>!gl.isContextLost()).length)).toBe(1);
  // One context served all ten route and locale transitions (no per-route rebuild).
  expect(await page.evaluate(()=>window.pixelAudit.contexts.length)).toBe(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-pixel-canvas]')).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>window.pixelAudit.contexts.every(gl=>gl.isContextLost()))).toBeTruthy();
});

test('ripple reaches shader; offscreen rendering stops and resumes',async({page})=>{
  await instrument(page); await page.goto('/en/contact');await running(page,'contact');
  const box=await page.locator('[data-pixel-hero]').boundingBox();expect(box).not.toBeNull();
  await page.mouse.click(box!.x+box!.width*.85,box!.y+box!.height*.35);
  await expect.poll(()=>page.evaluate(()=>window.pixelAudit.ripple)).toBeTruthy();
  await page.locator('footer').last().scrollIntoViewIfNeeded();
  await expect(page.locator('[data-pixel-engine]')).toHaveAttribute('data-state','paused');
  const draws=await page.evaluate(()=>window.pixelAudit.draws);await page.waitForTimeout(300);
  expect(await page.evaluate(()=>window.pixelAudit.draws)).toBe(draws);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await running(page,'contact');
  await expect.poll(()=>page.evaluate(()=>window.pixelAudit.draws)).toBeGreaterThan(draws);
});

test('reduced motion uses visible static field without a WebGL context',async({page})=>{
  await instrument(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/ar/about');
  await expect(page.locator('[data-hero-pixels]')).toHaveAttribute('data-motion','static');
  await expect(page.locator('[data-pixel-canvas]')).toHaveCount(0);
  expect(await page.evaluate(()=>window.pixelAudit.contexts.length)).toBe(0);
  expect(await page.locator('[data-hero-pixels] > span').evaluate(el=>getComputedStyle(el).backgroundImage)).not.toBe('none');
  await page.emulateMedia({reducedMotion:'no-preference'});await running(page,'about');
});

test('WebGL unavailable and lost context both preserve fallback',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this: HTMLCanvasElement,...args:Parameters<typeof original>){return args[0]==='webgl2'?null:original.apply(this,args);} as typeof original;
  });
  await page.goto('/en/services');
  await expect(page.locator('[data-pixel-engine]')).toHaveAttribute('data-state','fallback');
  await expect(page.locator('[data-pixel-canvas]')).toHaveCount(0);
  await expect(page.locator('[data-hero-pixels] > span')).toBeVisible();
});

test('context loss releases resources and leaves static treatment',async({page})=>{
  await instrument(page);await page.goto('/en/work');await running(page,'work');
  await page.evaluate(()=>window.pixelAudit.contexts.at(-1)!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(page.locator('[data-pixel-engine]')).toHaveAttribute('data-state','fallback');
  await expect(page.locator('[data-pixel-canvas]')).toHaveCount(0);
  await expect(page.locator('[data-hero-pixels] > span')).toBeVisible();
});

test('hero CTAs navigate and contact form remains editable',async({page})=>{
  await page.goto('/en');await running(page,'home');
  await page.locator('[data-pixel-hero] a[href="/en/work"]').click();await running(page,'work');
  await page.goto('/en');await running(page,'home');
  await page.locator('[data-pixel-hero] a[href="/en/contact"]').click();await running(page,'contact');
  const name=page.getByRole('textbox',{name:/^Name/});await name.fill('Local visual check');await expect(name).toHaveValue('Local visual check');
});

for(const locale of ['en','ar']) test(`${locale}: Field Notes and Next Move use dark brand surfaces`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/${locale}`);
  const notes=page.locator('section').filter({hasText:'05 / FIELD NOTES'});
  const next=page.getByTestId('final-cta');
  await expect(notes).toHaveCSS('background-color','rgb(16, 16, 20)');
  await expect(next).toHaveCSS('background-color','rgb(22, 22, 27)');
  await expect(notes.locator('h2')).toHaveCSS('color','rgb(240, 238, 231)');
  await expect(next.locator('.button-primary')).toHaveCSS('background-color','rgb(202, 255, 74)');
  await notes.locator('a').click();await expect(page).toHaveURL(new RegExp(`/${locale}/insights$`));
  await page.goto(`/${locale}`);await next.locator('a').click();await expect(page).toHaveURL(new RegExp(`/${locale}/contact$`));
});
