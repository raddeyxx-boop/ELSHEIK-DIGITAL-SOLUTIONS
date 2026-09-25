import { test, expect } from "@playwright/test";
for (const locale of ["en", "ar"])
  for (const width of [1440, 390]) {
    test(`${locale} workflow icons, arrival pulses and replay at ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const workflow = page.getByTestId("connected-workflow"),
        simulation = page.getByTestId("live-simulation");
      await workflow.scrollIntoViewIfNeeded();
      const map = page.getByTestId(
        width === 1440 ? "workflow-desktop" : "workflow-mobile",
      );
      await expect(map).toBeVisible();
      await expect(map.locator("[data-node] > svg")).toHaveCount(7);
      for (const icon of await map.locator("[data-node] > svg").all()) {
        await expect(icon).toBeVisible();
        const size = await icon.boundingBox();
        expect(size!.width).toBeGreaterThan(15);
        expect(size!.height).toBeGreaterThan(15);
      }
      await expect(simulation).toHaveAttribute("data-stage", "4", {
        timeout: 7000,
      });
      await expect(map.locator('[data-arrived="true"]')).toHaveCount(7);
      const replay = simulation.getByRole("button");
      await expect(replay).toBeEnabled();
      await replay.click();
      await expect(simulation).toHaveAttribute("data-stage", "0");
      await expect(map.locator('[data-node="notify"]')).toHaveAttribute(
        "data-arrived",
        "false",
      );
      await expect(map.locator('[data-destination="next"]')).toHaveCount(1);
      await expect(simulation).toHaveAttribute("data-stage", "1");
      for (const node of ["next", "supabase"])
        await expect(map.locator(`[data-node="${node}"]`)).toHaveAttribute(
          "data-pulsing",
          "true",
        );
      await expect(map.locator('[data-node="notify"]')).toHaveAttribute(
        "data-arrived",
        "false",
      );
      await expect(simulation).toHaveAttribute("data-stage", "4", {
        timeout: 7000,
      });
      await expect(map.locator('[data-node="notify"]')).toHaveAttribute(
        "data-pulsing",
        "true",
      );
      await workflow.screenshot({
        path: `.artifacts/workflow/${locale}-${width}-arrival.png`,
        style:
          "body > header, .skip-link, nextjs-portal {visibility:hidden !important}",
      });
      await expect(replay).toBeEnabled();
      await workflow.screenshot({
        path: `.artifacts/workflow/${locale}-${width}.png`,
        animations: "disabled",
        style:
          "body > header, .skip-link, nextjs-portal {visibility:hidden !important}",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await expect(map.locator('[data-arrived="true"]')).toHaveCount(7);
      await expect(map.locator("[data-destination]")).toHaveCount(0);
      await simulation.getByRole("button").click();
      await expect(simulation).toHaveAttribute("data-stage", "4");
      await expect(simulation.getByRole("button")).toBeEnabled();
    });
  }
