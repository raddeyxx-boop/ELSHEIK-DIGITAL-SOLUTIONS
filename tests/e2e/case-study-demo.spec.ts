import { expect, test, type Page } from "@playwright/test";

const route = "/en/work/relax-moon-spa-automation";

async function greet(page: Page, locale: "en" | "ar" = "en") {
  const input = locale === "en" ? 'Type "Hi" or start the conversation…' : "اكتب سلام أو ابدأ المحادثة…";
  await page.getByLabel(input).fill(locale === "en" ? "Hi" : "سلام");
  await page.getByRole("button", { name: locale === "en" ? "Send message" : "إرسال الرسالة" }).click();
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "intent");
}

test("case-study card opens the interactive demo and booking completes locally", async ({ page }) => {
  await page.goto("/en");
  await page.getByTestId("featured-case-study").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /view case study/i }).click();
  await expect(page).toHaveURL(route);
  await expect(page.getByTestId("booking-demo")).toBeVisible();

  const interactionRequests: string[] = [];
  page.on("request", (request) => interactionRequests.push(request.url()));
  await greet(page);
  await expect(page.getByText(/Welcome to Relax Moon Spa/)).toBeVisible();
  await page.getByRole("button", { name: "Book an appointment" }).click();
  for (const option of ["Thai massage", "Tomorrow", "7:00 PM", "Home", "Use demo location", "No preference"]) {
    await page.getByRole("button", { name: option, exact: true }).click();
  }
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "bookingConfirmed", { timeout: 8_000 });
  await expect(page.getByText("BOOKING JOURNEY COMPLETE")).toBeVisible();
  await expect(page.getByTestId("system-execution").getByText("COMPLETE")).toHaveCount(9);
  expect(interactionRequests).toEqual([]);
  await page.getByRole("button", { name: "Restart demo" }).click();
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "idle");
});

test("reschedule and both cancellation policy paths work", async ({ page }) => {
  await page.goto(route);
  await greet(page);
  await page.getByRole("button", { name: "Change my appointment" }).click();
  await page.getByRole("button", { name: "Use Demo Booking" }).click();
  await page.getByRole("button", { name: "Tomorrow", exact: true }).click();
  await page.getByRole("button", { name: "9:00 PM", exact: true }).click();
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "rescheduleConfirmed", { timeout: 8_000 });
  await page.getByRole("button", { name: "Restart demo" }).click();

  await greet(page);
  await page.getByRole("button", { name: "Cancel my booking" }).click();
  await page.getByRole("button", { name: "Use Demo Booking" }).click();
  await page.getByRole("button", { name: "Less than one hour away" }).click();
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "cancelDenied");
  await page.getByRole("button", { name: "Restart demo" }).click();

  await greet(page);
  await page.getByRole("button", { name: "Cancel my booking" }).click();
  await page.getByRole("button", { name: "Use Demo Booking" }).click();
  await page.getByRole("button", { name: "More than one hour away" }).click();
  await expect(page.getByTestId("booking-demo")).toHaveAttribute("data-state", "cancelConfirmed", { timeout: 8_000 });
});

test("Arabic greeting and RTL journey are localized", async ({ page }) => {
  await page.goto("/ar/work/relax-moon-spa-automation");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await greet(page, "ar");
  await expect(page.getByText(/حيّاك الله في ريلاكس مون سبا/)).toBeVisible();
  await expect(page.getByRole("button", { name: "أبي أحجز موعد" })).toBeVisible();
});

test("mobile demo remains usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.getByTestId("booking-demo").scrollIntoViewIfNeeded();
  await greet(page);
  await page.getByRole("button", { name: "Book an appointment" }).click();
  await expect(page.getByRole("button", { name: "Thai massage" })).toBeVisible();
  const width = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport + 1);
});
