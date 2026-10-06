"use server";
import { revalidatePath } from "next/cache";
import { revalidatePublicSite } from "@/server/revalidate-public";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { caseStudySchema, projectSchema } from "@/lib/validation/project";
const text = (f: FormData, k: string) => String(f.get(k) || "").trim();
async function authorized() {
  const s = await getAdminSession();
  if (!s.user || !s.role) throw new Error("Unauthorized");
  const client = await createClient();
  if (!client) throw new Error("Supabase is not configured");
  return { client, user: s.user };
}
export async function saveProject(form: FormData) {
  const raw = {
    id: text(form, "id") || undefined,
    slug: text(form, "slug"),
    title_en: text(form, "title_en"),
    title_ar: text(form, "title_ar"),
    summary_en: text(form, "summary_en"),
    summary_ar: text(form, "summary_ar"),
    industry_en: text(form, "industry_en"),
    industry_ar: text(form, "industry_ar"),
    year: text(form, "year"),
    seo_title_en: text(form, "seo_title_en"),
    seo_title_ar: text(form, "seo_title_ar"),
    seo_description_en: text(form, "seo_description_en"),
    seo_description_ar: text(form, "seo_description_ar"),
    canonical_url: text(form, "canonical_url"),
    cover_media_id: text(form, "cover_media_id"),
    status: text(form, "status"),
    featured: form.get("featured") === "on",
    sort_order: Number(text(form, "sort_order") || 0),
  };
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Project fields are invalid");
  const { client, user } = await authorized();
  const clean = {
    ...parsed.data,
    cover_media_id: parsed.data.cover_media_id || null,
    canonical_url: parsed.data.canonical_url || null,
    published_at:
      parsed.data.status === "published" ? new Date().toISOString() : null,
    updated_by: user.id,
  };
  let id = parsed.data.id;
  if (id) {
    const { error } = await client.from("projects").update(clean).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await client
      .from("projects")
      .insert({ ...clean, created_by: user.id })
      .select("id")
      .single();
    if (error || !data)
      throw new Error(error?.message || "Project could not be created");
    id = data.id;
  }
  revalidatePath("/admin/projects");
  revalidatePath("/en/work");
  revalidatePath("/ar/work");
  revalidatePublicSite();
  redirect(`/admin/projects/${id}`);
}
export async function saveCaseStudy(form: FormData) {
  const raw = {
    project_id: text(form, "project_id"),
    overview_en: text(form, "overview_en"),
    overview_ar: text(form, "overview_ar"),
    challenge_en: text(form, "challenge_en"),
    challenge_ar: text(form, "challenge_ar"),
    objectives_en: text(form, "objectives_en"),
    objectives_ar: text(form, "objectives_ar"),
    solution_en: text(form, "solution_en"),
    solution_ar: text(form, "solution_ar"),
    security_en: text(form, "security_en"),
    security_ar: text(form, "security_ar"),
    status: text(form, "status"),
  };
  const parsed = caseStudySchema.safeParse(raw);
  if (!parsed.success) throw new Error("Case study fields are invalid");
  const { client } = await authorized();
  const { error } = await client
    .from("case_studies")
    .upsert(
      {
        ...parsed.data,
        published_at:
          parsed.data.status === "published" ? new Date().toISOString() : null,
      },
      { onConflict: "project_id" },
    );
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${parsed.data.project_id}`);
  revalidatePublicSite();
  redirect(`/admin/projects/${parsed.data.project_id}`);
}
