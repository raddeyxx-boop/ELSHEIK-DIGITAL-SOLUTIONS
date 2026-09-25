import { test, expect } from "@playwright/test";

for (const locale of ["en", "ar"]) {
  test(`${locale} stationary pointer cannot select a row moved by collapse`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/services`);
    const row = page.locator("[data-service-row]").first();
    await row.getByRole("link").focus();
    await expect(row).toHaveAttribute("data-active", "true");
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = (await row.boundingBox())!;
    const x = box.x + box.width * 0.65,
      y = Math.min(850, box.y + box.height - 35);
    await page.mouse.move(x, y);
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-service-preview]")).toHaveCount(0);
    await page.waitForTimeout(650);
    await expect(
      page.locator('[data-service-row][data-active="true"]'),
    ).toHaveCount(0);
    const under = await page.evaluate(
      ({ x, y }) =>
        document
          .elementFromPoint(x, y)
          ?.closest("[data-service-row]")
          ?.getAttribute("data-service-row"),
      { x, y },
    );
    expect(under).toBeTruthy();
    expect(under).not.toBe(await row.getAttribute("data-service-row"));
    await page.mouse.move(x + 6, y + 2);
    await expect(page.locator(`[data-service-row="${under}"]`)).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  test(`${locale} all sequences finish, hold and switch including last to first`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/services`);
    const rows = page.locator("[data-service-row]");
    for (const i of [0, 1, 2, 3, 4, 5, 0]) {
      await rows.nth(i).hover({ position: { x: 180 + i * 25, y: 80 } });
      await expect(rows.nth(i)).toHaveAttribute("data-active", "true");
      const preview = rows.nth(i).locator("[data-service-preview]");
      await expect(preview).toHaveAttribute("data-stage", "4", {
        timeout: 5000,
      });
      await expect(preview).toHaveAttribute("data-running", "false");
      await page.waitForTimeout(500);
      await expect(preview).toHaveAttribute("data-stage", "4");
      await expect(page.locator("[data-service-preview]")).toHaveCount(1);
    }
  });

  for (const width of [390, 430])
    test(`${locale} ${width} touch switches all six services`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:3000/${locale}/services`);
      const rows = page.locator("[data-service-row]");
      for (let i = 0; i < 6; i++) {
        await rows.nth(i).locator("h2").tap();
        await expect(rows.nth(i)).toHaveAttribute("data-active", "true");
        await expect(
          page.locator('[data-service-row][data-active="true"]'),
        ).toHaveCount(1);
        await expect(
          rows.nth(i).locator("[data-service-preview]"),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await rows.last().locator("h2").tap();
      await expect(page.locator("[data-service-preview]")).toHaveCount(0);
      await context.close();
    });
}

test("keyboard focus and Space reveal; native CTA Enter navigates", async ({
  page,
}) => {
  await page.goto("/en/services");
  const row = page.locator("[data-service-row]").first();
  await row.getByRole("link").focus();
  await expect(row).toHaveAttribute("data-active", "true");
  await page.keyboard.press("Escape");
  await expect(row).toHaveAttribute("data-active", "false");
  await page.keyboard.press("Space");
  await expect(row).toHaveAttribute("data-active", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/contact$/);
});

test("mobile-width keyboard activation preserves service-anchor navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const row = page.locator("[data-service-row]").nth(2);
  await row.getByRole("link").focus();
  await expect(row).toHaveAttribute("data-active", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/services#mobile-applications$/);
});
