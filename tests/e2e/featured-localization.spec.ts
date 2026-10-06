import { test, expect } from "@playwright/test";
const english = {
  slogan: ["WELLNESS", "MEETS", "AUTOMATION."],
  steps: ["Customer request", "WhatsApp", "Automation engine", "Check availability", "Assign specialist", "Calendar & database", "Confirmation sent"],
  header: ["Relax Moon Spa", "Business Account"],
  messages: ["Hello! I'd like to book an appointment.", "What service would you like?", "Massage Therapy", "Great. When would you like to come?", "Tomorrow at 5 PM", "Your appointment is confirmed."],
};
const arabic = {
  slogan: ["راحة العميل،", "مدعومة بالأتمتة"],
  steps: ["طلب العميل", "واتساب", "محرك الأتمتة", "التحقق من التوفر", "تعيين الأخصائي", "التقويم وقاعدة البيانات", "إرسال التأكيد"],
  header: ["ريلاكس مون سبا", "حساب الأعمال"],
  messages: ["مرحبًا، أرغب في حجز موعد", "ما الخدمة التي ترغب بها؟", "جلسة مساج", "ممتاز، متى ترغب في حجز الموعد؟", "غدًا الساعة 5 مساءً", "تم تأكيد موعدك بنجاح"],
};
for (const locale of ["en", "ar"] as const) for (const width of [1440, 390]) {
  test(`${locale} featured case localization at ${width}px preserves animation and text bounds`, async ({ page }) => {
    const copy = locale === "ar" ? arabic : english;
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/${locale}`);
    const section = page.getByTestId("featured-case-study");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute("data-stage", "6", { timeout: 10000 });
    const flow = section.getByRole("list");
    await expect(flow.locator("li")).toHaveCount(7);
    await expect(flow.locator("li > span")).toHaveText(["01", "02", "03", "04", "05", "06", "07"]);
    await expect(flow.locator("svg")).toHaveCount(6);
    for (const label of copy.steps) await expect(flow).toContainText(label);
    const phone = section.locator('[class*="phone"]');
    for (const label of [...copy.header, ...copy.messages]) await expect(phone.getByText(label, { exact: true })).toBeVisible();
    for (const message of copy.messages) await expect(phone.getByText(message, { exact: true })).toHaveCSS("opacity", "1");
    const slogan = section.locator('[class*="spaVisual"] strong');
    await expect(slogan.locator("br")).toHaveCount(copy.slogan.length - 1);
    for (const line of copy.slogan) await expect(slogan).toContainText(line);
    await expect(section.getByRole("link", { name: locale === "ar" ? "عرض دراسة الحالة" : "View case study" })).toHaveAttribute("href", new RegExp(`^/${locale}/work/`));
    if (locale === "ar") {
      for (const label of [...english.slogan, ...english.steps, ...english.header, ...english.messages]) await expect(section).not.toContainText(label);
      await expect(slogan).toHaveAttribute("dir", "rtl");
      await expect(phone.locator("header")).toHaveAttribute("dir", "rtl");
      for (const message of copy.messages) {
        await expect(phone.getByText(message, { exact: true })).toHaveCSS("direction", "rtl");
        await expect(phone.getByText(message, { exact: true })).toHaveCSS("text-align", "right");
      }
    }
    const clipping = await section.evaluate(root => {
      const failures: string[] = [];
      for (const stage of root.querySelectorAll("ol li")) {
        const number = stage.querySelector("span")!, icon = stage.querySelector("svg");
        if (!icon) continue;
        const range = document.createRange(); range.selectNodeContents(number);
        const text = range.getBoundingClientRect(), check = icon.getBoundingClientRect();
        if (text.left < check.right && text.right > check.left && text.top < check.bottom && text.bottom > check.top) failures.push("Step number overlaps completion icon");
      }
      for (const node of root.querySelectorAll('[class*="chat"] p, [class*="phone"] header b, [class*="phone"] header small, [class*="spaVisual"] strong, ol li bdi')) {
        const range = document.createRange(); range.selectNodeContents(node);
        const boundary = node.matches("strong") ? node.parentElement!.getBoundingClientRect() : node.getBoundingClientRect();
        for (const rect of range.getClientRects()) if (rect.left < boundary.left - 1 || rect.right > boundary.right + 1 || rect.top < boundary.top - 1 || rect.bottom > boundary.bottom + 1) failures.push(node.textContent || "");
      }
      return { failures, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(clipping).toEqual({ failures: [], overflow: false });
    await section.screenshot({ path: `.artifacts/featured-localization/animated-${locale}-${width}.png`, animations: "disabled", style: "body > header, .skip-link, nextjs-portal { visibility: hidden !important; }" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    for (const message of copy.messages) await expect(section.getByText(message, { exact: true })).toHaveCSS("opacity", "1");
  });
}
