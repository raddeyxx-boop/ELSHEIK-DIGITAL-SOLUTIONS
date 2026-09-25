import { test, expect } from "@playwright/test";
test("English and Arabic public routes work", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/business complexity/i);
  await page.getByRole("link", { name: "العربية" }).first().click();
  await expect(page).toHaveURL(/\/ar/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/en/services");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/en/work");
  await expect(page.getByText("Relax Moon Spa", { exact: true })).toBeVisible();
});
test("contact validation and admin login shell work", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByLabel("Name").fill("A");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Project description").fill("short");
  await page.getByRole("button", { name: "Send project brief" }).click();
  await expect(page.locator("[aria-invalid=true]").first()).toBeVisible();
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
