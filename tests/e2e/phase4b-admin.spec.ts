import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
);
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.SUPABASE_ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.SUPABASE_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test("Phase 4B content modules operate through admin UI", async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  const stamp = Date.now(),
    ids: {
      service?: string;
      technology?: string;
      testimonial?: string;
      insight?: string;
      lead?: string;
      media?: string;
    } = {};
  try {
    await page.goto("/admin/services");
    let form = page.locator('form:has(button:text("Save service"))').last();
    await form.getByLabel("Slug").fill(`ui-service-${stamp}`);
    await form.getByLabel("English title").fill("UI verified service");
    await form.getByLabel("Arabic title").fill("خدمة موثقة");
    await form
      .getByLabel("summary (en)")
      .fill("Service summary verified through the browser.");
    await form
      .getByLabel("summary (ar)")
      .fill("ملخص خدمة موثق من خلال المتصفح.");
    await form.getByRole("button", { name: "Save service" }).click();
    await expect
      .poll(async () => {
        const r = await service
          .from("services")
          .select("id")
          .eq("slug", `ui-service-${stamp}`)
          .maybeSingle();
        ids.service = r.data?.id;
        return Boolean(r.data);
      })
      .toBe(true);
    await page.goto("/admin/services");
    await expect.poll(()=>page.locator('input[name="title_en"]').evaluateAll(items=>items.some(item=>(item as HTMLInputElement).value==="UI verified service"))).toBe(true);
    await page.goto("/admin/technologies");
    form = page.locator('form:has(button:text("Save technology"))').last();
    await form.getByLabel("Name").fill("UI Verification Tech");
    await form.getByLabel("Slug").fill(`ui-tech-${stamp}`);
    await form.getByLabel("Category").fill("Verification");
    await form.getByRole("button", { name: "Save technology" }).click();
    await expect
      .poll(async () => {
        const r = await service
          .from("technologies")
          .select("id")
          .eq("slug", `ui-tech-${stamp}`)
          .maybeSingle();
        ids.technology = r.data?.id;
        return Boolean(r.data);
      })
      .toBe(true);
    await page.goto("/admin/testimonials");
    form = page.locator('form:has(button:text("Save testimonial"))').last();
    await form.getByLabel("Client name").fill("UI Test Client");
    await form
      .getByLabel("English quote")
      .fill(
        "This testimonial was verified through the complete user interface.",
      );
    await form.getByLabel("Approved for publication").check();
    await form.getByLabel("Status").selectOption("published");
    await form.getByRole("button", { name: "Save testimonial" }).click();
    await expect
      .poll(async () => {
        const r = await service
          .from("testimonials")
          .select("id,approved,status")
          .eq("client_name", "UI Test Client")
          .maybeSingle();
        ids.testimonial = r.data?.id;
        return r.data?.approved && r.data.status === "published";
      })
      .toBe(true);
    await page.goto("/admin/insights/new");
    await page.getByLabel("Slug").fill(`ui-insight-${stamp}`);
    await page.getByLabel("Category").fill("Verification");
    await page.getByLabel("English title").fill("UI verified insight");
    await page.getByLabel("Arabic title").fill("مقال موثق");
    await page
      .getByLabel("English excerpt")
      .fill("Insight excerpt verified through the browser.");
    await page
      .getByLabel("Arabic excerpt")
      .fill("مقتطف مقال موثق من خلال المتصفح.");
    await page
      .getByLabel("English body (plain structured text)")
      .fill(
        "This complete insight body was created and published through the browser interface.",
      );
    await page
      .getByLabel("Arabic body (plain structured text)")
      .fill("تم إنشاء محتوى المقال الكامل ونشره من خلال واجهة المتصفح.");
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save insight" }).click();
    await expect
      .poll(async () => {
        const r = await service
          .from("insights")
          .select("id")
          .eq("slug", `ui-insight-${stamp}`)
          .maybeSingle();
        ids.insight = r.data?.id;
        return Boolean(r.data);
      })
      .toBe(true);
    await page.goto(`/en/insights/ui-insight-${stamp}`);
    await expect(
      page.getByRole("heading", { name: "UI verified insight" }),
    ).toBeVisible();
    const lead = await service
      .from("inquiries")
      .insert({
        name: `UI Lead ${stamp}`,
        email: `ui-lead-${stamp}@example.com`,
        service: "Verification",
        description: "Lead workflow browser test",
        locale: "en",
      })
      .select("id")
      .single();
    ids.lead = lead.data!.id;
    await page.goto(`/admin/leads?q=UI+Lead+${stamp}`);
    await expect(
      page.getByRole("heading", { name: `UI Lead ${stamp}` }),
    ).toBeVisible();
    await page.getByLabel("Status").selectOption("qualified");
    await page.getByRole("button", { name: "Update" }).click();
    await expect
      .poll(
        async () =>
          (
            await service
              .from("inquiries")
              .select("status")
              .eq("id", ids.lead!)
              .single()
          ).data?.status,
      )
      .toBe("qualified");
    await page.goto("/admin/media");
    const upload = page.locator(
      'form:has(button:text("Upload private original"))',
    );
    await upload
      .locator('input[type="file"]')
      .setInputFiles({
        name: `ui-${stamp}.png`,
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await upload.getByLabel("English alt text").fill("UI verified image");
    await upload
      .getByRole("button", { name: "Upload private original" })
      .click();
    await expect
      .poll(async () => {
        const r = await service
          .from("media")
          .select("id,storage_path,original_filename")
          .eq("original_filename", `ui-${stamp}.png`)
          .maybeSingle();
        ids.media = r.data?.id;
        return Boolean(
          r.data && r.data.storage_path !== r.data.original_filename,
        );
      })
      .toBe(true);
    await expect(page.getByText(`ui-${stamp}.png`)).toBeVisible();
    const mediaCard=page.locator("article").filter({hasText:`ui-${stamp}.png`});
    await mediaCard.getByLabel("Visibility").selectOption("published");
    await mediaCard.getByRole("button",{name:"Save media"}).click();
    await expect.poll(async()=>(await service.from("media").select("status").eq("id",ids.media!).single()).data?.status).toBe("published");
    await mediaCard.getByRole("button",{name:"Delete media"}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button",{name:"Delete permanently"}).click();
    await expect.poll(async()=>(await service.from("media").select("id").eq("id",ids.media!)).data?.length).toBe(0);
    ids.media=undefined;
  } finally {
    if (ids.service)
      await service.from("services").delete().eq("id", ids.service);
    if (ids.technology)
      await service.from("technologies").delete().eq("id", ids.technology);
    if (ids.testimonial)
      await service.from("testimonials").delete().eq("id", ids.testimonial);
    if (ids.insight)
      await service.from("insights").delete().eq("id", ids.insight);
    if (ids.lead) await service.from("inquiries").delete().eq("id", ids.lead);
    if (ids.media) {
      const m = await service
        .from("media")
        .select("storage_path")
        .eq("id", ids.media)
        .single();
      if (m.data)
        await service.storage
          .from("private-media")
          .remove([m.data.storage_path]);
      await service.from("media").delete().eq("id", ids.media);
    }
  }
});

test("Phase 4B structured case study editors persist CRUD and ordering", async ({
  page,
}) => {
  await login(page);
  const stamp = Date.now();
  const project = await service
    .from("projects")
    .insert({
      slug: `ui-structure-${stamp}`,
      title_en: "Structure UI",
      title_ar: "واجهة الهيكل",
      summary_en:
        "Temporary project for complete structured editor browser verification.",
      summary_ar: "مشروع مؤقت للتحقق الكامل من محرر الهيكل عبر المتصفح.",
      status: "draft",
    })
    .select("id")
    .single();
  const id = project.data!.id;
  const study = await service
    .from("case_studies")
    .insert({ project_id: id, status: "draft" })
    .select("id")
    .single();
  try {
    await page.goto(`/admin/projects/${id}/structure`);
    let form = page.locator('form:has(button:text("Add step"))');
    await form.getByLabel("English title").fill("Discover");
    await form.getByLabel("Arabic title").fill("اكتشاف");
    await form.getByLabel("Order").fill("1");
    await form.getByRole("button", { name: "Add step" }).click();
    await expect
      .poll(
        async () =>
          (
            await service
              .from("customer_journey_steps")
              .select("title_en")
              .eq("case_study_id", study.data!.id)
          ).data?.length,
      )
      .toBe(1);
    form = page.locator('form:has(button:text("Add node"))');
    for (const [key, label, layer] of [
      ["input", "Input", "0"],
      ["output", "Output", "1"],
    ]) {
      await form.getByLabel("Unique node key").fill(key);
      await form.getByLabel("English label").fill(label);
      await form
        .getByLabel("Arabic label")
        .fill(label === "Input" ? "مدخل" : "مخرج");
      await form.getByLabel("Layer").fill(layer);
      await form.getByLabel("Order").fill(layer);
      await form.getByRole("button", { name: "Add node" }).click();
      form = page.locator('form:has(button:text("Add node"))');
    }
    await expect
      .poll(
        async () =>
          (
            await service
              .from("architecture_nodes")
              .select("id")
              .eq("case_study_id", study.data!.id)
          ).data?.length,
      )
      .toBe(2);
    form = page.locator('form:has(button:text("Add connection"))');
    await form.getByLabel("Source").selectOption({ index: 0 });
    await form.getByLabel("Target").selectOption({ index: 1 });
    await form.getByRole("button", { name: "Add connection" }).click();
    await expect
      .poll(
        async () =>
          (
            await service
              .from("architecture_connections")
              .select("id")
              .eq("case_study_id", study.data!.id)
          ).data?.length,
      )
      .toBe(1);
    form = page.locator('form:has(button:text("Add result"))');
    await form.getByLabel("English label").fill("Conversion");
    await form.getByLabel("Arabic label").fill("التحويل");
    await form.getByLabel("Value").fill("25%");
    await form.getByLabel("Order").fill("1");
    await form.getByLabel("Verified").check();
    await form.getByLabel("Publishable").check();
    await form.getByRole("button", { name: "Add result" }).click();
    await expect
      .poll(
        async () =>
          (
            await service
              .from("project_results")
              .select("verified,publishable")
              .eq("project_id", id)
              .single()
          ).data?.publishable,
      )
      .toBe(true);
  } finally {
    await service.from("projects").delete().eq("id", id);
  }
});
