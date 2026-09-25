import { expect, test } from "@playwright/test";

for (const locale of ["en", "ar"] as const) {
  test(`${locale} insights renders the intentional editorial empty state`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}/insights`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(locale === "en" ? "New engineering notes are being prepared." : "نعمل على إعداد رؤى هندسية جديدة.")).toBeVisible();
    await expect(page.getByText("UI verified insight")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
  });
}

test("verification article is denied on the public reader route and absent from sitemap", async ({ page, request }) => {
  await page.goto("/en/insights/ui-insight-1788516563751");
  await expect(page.getByText("404 / Not found")).toBeVisible();
  await expect(page.getByText("UI verified insight")).toHaveCount(0);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("ui-insight-1788516563751");
});
