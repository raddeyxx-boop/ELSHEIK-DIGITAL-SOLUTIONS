import { expect, test } from "@playwright/test";

test("service scene JavaScript waits for preview intent", async ({ page }) => {
  await page.goto("/en/services");
  await page.waitForTimeout(1000);
  const scripts = await page.evaluate(() => performance.getEntriesByType("resource")
    .filter(e => e.name.includes("/_next/static/") && e.name.endsWith(".js"))
    .map(e => e.name));
  for (const url of scripts) expect(await (await page.request.get(url)).text()).not.toContain("data-service-preview");
  const row = page.locator("[data-service-row]").first();
  await row.scrollIntoViewIfNeeded();
  await row.hover({ position: { x: 150, y: 50 } });
  await expect(row.locator("[data-service-preview]")).toBeVisible();
});

test("WebGL fallback avoids the graphics download and navigation keeps the document", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      return args[0] === "webgl2" ? null : original.apply(this, args);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect(page.locator("[data-pixel-engine]")).toHaveAttribute(
    "data-state",
    "fallback",
  );
  await page.waitForTimeout(1200);
  const scripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.endsWith(".js"))
      .map((entry) => entry.name),
  );
  for (const url of scripts) {
    const response = await page.request.get(url);
    expect(await response.text()).not.toContain("uRippleIntensity");
  }
  await page.evaluate(() => {
    (window as unknown as { documentMarker: string }).documentMarker =
      "retained";
  });
  await page
    .locator(
      'header nav[aria-label="Primary navigation"] a[href="/en/services"]',
    )
    .click();
  await expect(page).toHaveURL(/\/en\/services$/);
  expect(
    await page.evaluate(
      () => (window as unknown as { documentMarker: string }).documentMarker,
    ),
  ).toBe("retained");
  expect(errors).toEqual([]);
});

test("deferred contact validation and mocked submission preserve the form flow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let submissions = 0;
  await page.route("**/api/inquiries", async (route) => {
    submissions++;
    await route.fulfill({ json: { ok: true, persisted: true } });
  });
  await page.goto("/en/contact");
  await page.getByRole("button", { name: "Send project brief" }).click();
  await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible();
  expect(submissions).toBe(0);
  await page
    .getByRole("textbox", { name: /^Name/ })
    .fill("Performance verification");
  await page
    .getByRole("textbox", { name: /^Email/ })
    .fill("verification@example.invalid");
  await page
    .getByLabel("Project description")
    .fill(
      "A local test of the existing contact form validation and submission.",
    );
  await page.getByRole("button", { name: "Send project brief" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  expect(submissions).toBe(1);
  expect(errors).toEqual([]);
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
