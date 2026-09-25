import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
for (const locale of ["en", "ar"]) {
  test(`${locale} insights editorial layout and responsive empty state`, async ({
    page,
  }) => {
    await mkdir(".artifacts/insights", { recursive: true });
    for (const width of [1920, 1440, 1024, 768, 430, 390, 375, 320]) {
      await page.setViewportSize({ width, height: width > 768 ? 900 : 844 });
      await page.goto(`/${locale}/insights`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      await expect(page.locator("main")).not.toContainText(
        "UI verified insight",
      );
      const size = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(size.scroll).toBeLessThanOrEqual(size.width);
      expect((await page.locator("h1").boundingBox())!.y).toBeLessThan(240);
      if ([1440, 390].includes(width))
        await page.screenshot({
          path: `.artifacts/insights/${locale}-index-${width}.png`,
          fullPage: true,
        });
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/${locale}/insights$`),
    );
    await page.goto(`/${locale}/insights/ui-insight-1788516563751`);
    await expect(
      page.getByText("404 / Not found", { exact: true }),
    ).toBeVisible();
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
  });
}
