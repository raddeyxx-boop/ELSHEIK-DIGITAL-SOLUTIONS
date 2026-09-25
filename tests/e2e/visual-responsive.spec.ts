import { test, expect } from "@playwright/test";
for (const locale of ["en", "ar"]) {
  test(`${locale} homepage has no mobile overflow and exposes core experiences`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("homepage-hero")).toBeVisible();
    for (const section of [
      "services-showcase",
      "technology-in-action",
      "featured-case-study",
      "final-cta",
    ]) {
      await page.getByTestId(section).scrollIntoViewIfNeeded();
      await expect(page.getByTestId(section)).toBeVisible();
    }
    await expect(
      page.getByRole("button", { name: /automation|الأتمتة/i }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator('[aria-label*="Connected digital business"], [aria-label*="نظام أعمال رقمي"]')
        .getByRole("button"),
    ).toHaveCount(4);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    const simulation = page.getByTestId("live-simulation");
    await simulation.scrollIntoViewIfNeeded();
    await expect.poll(async () => simulation.getAttribute("data-stage"), { timeout: 7000 }).toBe("4");
    await expect(page.getByTestId("featured-case-study")).toHaveAttribute("data-stage", /[0-6]/);
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByTestId("homepage-hero")).toBeVisible();
    await expect(page.locator('[class*="packet"]')).toHaveCount(1);
  });
}
