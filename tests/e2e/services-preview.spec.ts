import { test, expect } from "@playwright/test";

const kinds = ["web", "apps", "mobile", "automation", "ai", "software"];
const sizes = [
  [1920, 1080],
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [430, 932],
  [390, 844],
  [375, 812],
  [320, 568],
];
const screenshotStyle =
  "body > header,.skip-link,nextjs-portal{visibility:hidden!important}";

for (const locale of ["en", "ar"])
  for (const route of ["", "/services"]) {
    test(`${locale}${route || "/home"} service layouts, six previews and reduced motion`, async ({
      page,
    }) => {
      test.setTimeout(120000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await page.goto(`/${locale}${route}`);
        const rows = page.locator("[data-service-row]");
        await expect(rows).toHaveCount(6);

        for (let i = 0; i < 6; i++) {
          const row = rows.nth(i);
          await row.scrollIntoViewIfNeeded();
          // Move away before checking the approved resting geometry.
          await page.mouse.move(0, 0);
          await expect(row).toHaveAttribute("data-active", "false");
          const rest = await row.boundingBox();

          const reference = await row.evaluate((el) => {
            const compact = el.parentElement?.dataset.serviceList === "compact";
            const clone = (compact ? el.querySelector("a")! : el).cloneNode(
              true,
            ) as HTMLElement;
            clone.className = clone.className.split(" ")[0];
            clone.removeAttribute("data-active");
            clone.removeAttribute("data-service-row");
            clone
              .querySelectorAll("button,[data-preview-slot]")
              .forEach((n) => n.remove());
            if (!compact)
              clone
                .querySelectorAll(":scope > div")
                .forEach((n) => n.removeAttribute("class"));
            el.after(clone);
            const r = clone.getBoundingClientRect();
            clone.remove();
            return { width: r.width, height: r.height };
          });
          expect(rest!.height).toBeCloseTo(reference.height, 0);
          expect(rest!.width).toBeCloseTo(reference.width, 0);
          if (width <= 900) await row.getByRole("button").click();
          else await row.hover();
          const preview = row.locator("[data-service-preview]");
          await expect(preview).toHaveAttribute(
            "data-service-preview",
            kinds[i],
          );
          await expect(preview).toHaveAttribute("data-reduced", "true");
          await expect(
            page.locator('[data-service-preview][data-running="true"]'),
          ).toHaveCount(0);
          await expect(preview.locator("[data-signal]")).toHaveCount(0);
          if (kinds[i] === "automation") {
            const nodes = preview.locator("[data-node]");
            await expect(nodes).toHaveCount(5);
            const positions = await nodes.evaluateAll((elements) =>
              elements.map((el) => {
                const r = el.getBoundingClientRect();
                return { x: r.x, width: r.width, height: r.height };
              }),
            );
            for (const position of positions) {
              expect(position.width).toBeGreaterThan(65);
              expect(position.height).toBeGreaterThan(65);
            }
          }
          const box = await preview.boundingBox();
          expect(box!.width).toBeGreaterThan(width <= 900 ? 230 : 290);
          expect(box!.height).toBeGreaterThan(350);
          const scene = await preview
            .locator(":scope > div")
            .last()
            .boundingBox();
          expect(scene!.y + scene!.height).toBeLessThanOrEqual(
            box!.y + box!.height + 1,
          );
          expect((await row.boundingBox())!.height).toBeGreaterThan(
            rest!.height + 80,
          );
          if (kinds[i] === "mobile") {
            const phone = await preview
              .locator('[data-device="phone"]')
              .boundingBox();
            expect(phone!.height).toBeGreaterThan(300);
          }
          const bounds = await row.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
          expect(box!.x + box!.width).toBeLessThanOrEqual(
            bounds!.x + bounds!.width + 1,
          );
          expect(box!.y).toBeGreaterThanOrEqual(bounds!.y - 1);
          expect(box!.y + box!.height).toBeLessThanOrEqual(
            bounds!.y + bounds!.height + 1,
          );
          const intersections = await row.evaluate((el) => {
            const p = el
              .querySelector("[data-service-preview]")!
              .getBoundingClientRect();
            return Array.from(el.querySelectorAll("h2,h3,p,a.button,button"))
              .filter((n) => {
                const r = n.getBoundingClientRect();
                return (
                  r.width &&
                  r.height &&
                  r.left < p.right - 0.5 &&
                  r.right > p.left + 0.5 &&
                  r.top < p.bottom - 0.5 &&
                  r.bottom > p.top + 0.5
                );
              })
              .map((n) => n.textContent);
          });
          expect(intersections).toEqual([]);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          if ([1440, 430, 390, 375, 320].includes(width))
            await row.screenshot({
              path: `.artifacts/services/verified-${locale}-${width}-${route ? "detail" : "home"}-${kinds[i]}.png`,
              style: screenshotStyle,
            });
          if (width <= 900) await row.getByRole("button").click();
          else await page.mouse.move(0, 0);
          await expect(preview).toHaveCount(0);
        }
      }
    });
    test(`${locale}${route || "/home"} hover, keyboard, signals and navigation`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${locale}${route}`);
      const rows = page.locator("[data-service-row]");
      for (let i = 0; i < 6; i++) {
        const row = rows.nth(i);
        await row.hover({ position: { x: 180 + i * 25, y: 80 } });
        await expect(row).toHaveAttribute("data-active", "true");
        await expect(
          page.locator('[data-service-preview][data-running="true"]'),
        ).toHaveCount(1);
        await expect(row.locator("[data-service-preview]")).toHaveAttribute(
          "data-service-preview",
          kinds[i],
        );
        if (i === 3) {
          const signal = row.locator('[data-signal="automation"]');
          await expect(signal).toBeVisible();
          const initial = await signal.boundingBox();
          await page.waitForTimeout(150);
          expect((await signal.boundingBox())!.x).not.toBe(initial!.x);
          await expect(row.locator('[data-node="1"]')).toHaveAttribute(
            "data-arrived",
            "true",
          );
          expect(
            await row
              .locator('[data-node="1"] > div')
              .evaluate((el) => getComputedStyle(el).animationName),
          ).toContain("pulse");
          await expect(row.locator('[data-node="4"]')).toHaveAttribute(
            "data-arrived",
            "true",
          );
          await expect(signal).toHaveCount(0);
          await expect(row.locator("[data-node] svg")).toHaveCount(5);
        }
        if (i === 4)
          await expect(row.locator("[data-sequence-stage]")).toHaveAttribute(
            "data-sequence-stage",
            "3",
          );
        await row.screenshot({
          path: `.artifacts/services/motion-${locale}-${route ? "detail" : "home"}-${kinds[i]}.png`,
          style: screenshotStyle,
        });
      }
      await page.mouse.move(0, 0);
      await expect(page.locator("[data-service-preview]")).toHaveCount(0);
      // Tab from one native link to the next; every focused row demonstrates its service.
      await rows.first().getByRole("link").focus();
      for (let i = 0; i < 6; i++) {
        await expect(rows.nth(i)).toHaveAttribute("data-active", "true");
        if (i < 5) await page.keyboard.press("Tab");
      }
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-service-preview]")).toHaveCount(0);
      await rows.nth(3).getByRole("link").focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(
        route
          ? new RegExp(`/${locale}/contact$`)
          : new RegExp(`/${locale}/services#automation$`),
      );
      if (!route) await expect(page.locator("#automation")).toBeInViewport();
    });
  }
for (const locale of ["en", "ar"])
  test(`${locale} touch preview is separate from navigation and stops offscreen`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:3000/${locale}`);
    const row = page.locator("[data-service-row]").nth(2);
    await row.scrollIntoViewIfNeeded();
    const before = page.url();
    await row.getByRole("button").tap();
    await expect(row).toHaveAttribute("data-active", "true");
    expect(page.url()).toBe(before);
    await page.locator("footer").last().scrollIntoViewIfNeeded();
    await expect(page.locator("[data-service-preview]")).toHaveCount(0);
    await row.scrollIntoViewIfNeeded();
    await row.getByRole("button").tap();
    await expect(row).toHaveAttribute("data-active", "true");
    await row.getByRole("link").locator("svg").tap();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/services#mobile-applications$`),
    );
    await context.close();
  });

test("hover intent cancels incidental entry and switching stops the previous sequence", async ({
  page,
}) => {
  await page.goto("/en/services");
  const rows = page.locator("[data-service-row]");
  const first = rows.first();
  await first.scrollIntoViewIfNeeded();
  await first.dispatchEvent("pointerenter", {
    pointerType: "mouse",
    clientX: 100,
    clientY: 100,
  });
  await first.dispatchEvent("pointerleave", {
    pointerType: "mouse",
    clientX: 0,
    clientY: 0,
  });
  await page.waitForTimeout(150);
  await expect(page.locator("[data-service-preview]")).toHaveCount(0);
  await first.hover();
  await expect(first).toHaveAttribute("data-active", "true");
  await rows.nth(1).hover({ position: { x: 220, y: 100 } });
  await expect(rows.nth(1)).toHaveAttribute("data-active", "true");
  await expect(first.locator("[data-service-preview]")).toHaveCount(0);
  await expect(
    page.locator('[data-service-preview][data-running="true"]'),
  ).toHaveCount(1);
  await page.waitForTimeout(3800);
  await expect(
    page.locator('[data-service-preview][data-running="true"]'),
  ).toHaveCount(0);
});

for (const locale of ["en", "ar"])
  test(`${locale} touch row toggles without navigating; CTA remains separate`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    for (const route of ["", "/services"]) {
      await page.goto(`http://127.0.0.1:3000/${locale}${route}`);
      const row = page.locator("[data-service-row]").nth(2);
      await row.locator(route ? "h2" : "h3").tap();
      await expect(row).toHaveAttribute("data-active", "true");
      await expect(page).toHaveURL(new RegExp(`/${locale}${route}$`));
      await expect(row.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await row.locator(route ? "h2" : "h3").tap();
      await expect(row).toHaveAttribute("data-active", "false");
      await row.getByRole("button").tap();
      await expect(row).toHaveAttribute("data-active", "true");
      if (route) await row.getByRole("link").tap();
      else await row.getByRole("link").locator("svg").tap();
      await expect(page).toHaveURL(
        route
          ? new RegExp(`/${locale}/contact$`)
          : new RegExp(`/${locale}/services#mobile-applications$`),
      );
    }
    await context.close();
  });
