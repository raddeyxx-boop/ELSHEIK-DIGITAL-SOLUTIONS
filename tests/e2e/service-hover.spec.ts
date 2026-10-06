import { expect, test } from "@playwright/test";
import { previewCopy } from "../../src/components/services/preview-content";

for (const locale of ["en", "ar"] as const) for (const route of ["", "/services"]) for (const width of [1440, 390]) {
  test(`${locale}${route} ${width}: all six deferred previews preserve their scenes`, async ({ browser, baseURL }, testInfo) => {
    test.setTimeout(60000);
    const context = await browser.newContext({ baseURL, viewport: { width, height: 844 }, hasTouch: width === 390, isMobile: width === 390, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(`/${locale}${route}`);
    const rows = page.locator("[data-service-row]");
    await expect(rows).toHaveCount(6);
    const kinds = ["web", "apps", "mobile", "automation", "ai", "software"];
    for (let index = 0; index < kinds.length; index++) {
      const row = rows.nth(index);
      await row.scrollIntoViewIfNeeded();
      if (width === 390) await row.getByRole("button", { name: new RegExp(`^${previewCopy[locale].preview}:`) }).tap();
      else await row.hover({ position: { x: 150, y: 50 } });
      const scene = row.locator("[data-service-preview]");
      await expect(scene).toHaveAttribute("data-service-preview", kinds[index]);
      await expect(scene).toHaveAttribute("data-stage", "4");
      await expect(scene).toHaveAttribute("data-running", "false");
      if (index === 0) await testInfo.attach("preview-layout", { body: await page.screenshot(), contentType: "image/png" });
      await page.keyboard.press("Escape");
      await expect(row).toHaveAttribute("data-active", "false");
      await page.mouse.move(0, 0);
    }
    expect(errors).toEqual([]);
    await context.close();
  });
}

for (const route of ["/en", "/en/services"]) {
  test(`${route}: uninterrupted dwell, panel access, grace, Escape and fresh entry`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const row = page.locator("[data-service-row]").first();
    await row.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await row.hover({ position: { x: 150, y: 50 } });
    await page.waitForTimeout(400);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1600);
    await expect(row).toHaveAttribute("data-active", "false");
    await row.hover({ position: { x: 150, y: 50 } });
    await page.waitForTimeout(1200);
    await expect(row).toHaveAttribute("data-active", "false");
    await expect(row).toHaveAttribute("data-active", "true", { timeout: 1000 });
    const panel = row.locator("[data-preview-slot]");
    await panel.hover();
    await page.waitForTimeout(250);
    await expect(row).toHaveAttribute("data-active", "true");
    expect(
      await panel.evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe("auto");
    // Check actual hit testing: the panel, rather than the link underneath it,
    // receives pointer events without modifying its content.
    expect(
      await panel.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        );
      }),
    ).toBe(true);
    await page.mouse.move(0, 0);
    await panel.hover();
    await page.waitForTimeout(250);
    await expect(row).toHaveAttribute("data-active", "true");
    await page.keyboard.press("Escape");
    await expect(row).toHaveAttribute("data-active", "false");
    await page.mouse.move(0, 0);
    await row.hover({ position: { x: 150, y: 50 } });
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1600);
    await expect(row).toHaveAttribute("data-active", "false");
    await page.mouse.move(0, 0);
    await row.hover({ position: { x: 150, y: 50 } });
    await expect(row).toHaveAttribute("data-active", "true", { timeout: 2500 });
    await page.mouse.move(0, 0);
    await expect(row).toHaveAttribute("data-active", "false");
    expect(errors).toEqual([]);
  });

  test(`${route}: keyboard trigger and native links remain usable`, async ({
    page,
  }) => {
    await page.goto(route);
    const row = page.locator("[data-service-row]").first();
    const trigger =
      route === "/en"
        ? row.getByRole("link").first()
        : row.getByRole("button", { name: "Web Development", exact: true });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(row.locator("[data-preview-slot]")).toHaveAttribute(
      "id",
      (await trigger.getAttribute("aria-controls"))!,
    );
    // Focus can move within the service without dismissing its preview.
    if (route === "/en/services") {
      await row.getByRole("link", { name: "Start a project" }).focus();
    } else {
      await expect(trigger).toBeFocused();
    }
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.locator("header").getByRole("link").first().focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    if (route === "/en") {
      const destination = await trigger.getAttribute("href");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new URL(destination!, page.url()).href);
    } else {
      await page.keyboard.press("Enter");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await row.getByRole("link", { name: "Start a project" }).click();
      await expect(page).toHaveURL(/\/en\/contact$/);
    }
  });

  test(`${route}: mobile tap toggles and touching the panel keeps it open`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(route);
    const row = page.locator("[data-service-row]").first();
    await row.scrollIntoViewIfNeeded();
    const toggle = row.getByRole("button", { name: /Preview:/ });
    await toggle.tap();
    await expect(row).toHaveAttribute("data-active", "true");
    await row.locator("[data-preview-slot]").tap();
    await page.waitForTimeout(300);
    await expect(row).toHaveAttribute("data-active", "true");
    await row.getByRole("button", { name: /Close preview:/ }).tap();
    await expect(row).toHaveAttribute("data-active", "false");
    await context.close();
  });
}
