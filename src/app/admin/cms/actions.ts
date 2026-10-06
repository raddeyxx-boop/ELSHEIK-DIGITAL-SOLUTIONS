"use server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { revalidatePath as revalidateAdminPath } from "next/cache";
import { revalidatePublicSite } from "@/server/revalidate-public";
import sharp from "sharp";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  insightSchema,
  journeySchema,
  nodeSchema,
  resultSchema,
  serviceSchema,
  technologySchema,
  testimonialSchema,
} from "@/lib/validation/cms";
const text = (f: FormData, k: string) => String(f.get(k) || "").trim(),
  num = (f: FormData, k: string) => Number(text(f, k) || 0),
  checked = (f: FormData, k: string) => f.get(k) === "on";
// Every write below refreshes its admin screen and, unless it only touches private
// records (leads, settings), the statically generated public site.
function revalidatePath(path: string) {
  revalidateAdminPath(path);
  if (!/^\/admin\/(leads|settings)\b/.test(path)) revalidatePublicSite();
}
async function context(adminOnly = false) {
  const s = await getAdminSession();
  if (!s.user || !s.role || (adminOnly && s.role !== "admin"))
    throw new Error("Unauthorized");
  const db = await createClient();
  if (!db) throw new Error("Backend unavailable");
  return { db, user: s.user, role: s.role };
}
async function save(
  table: string,
  id: string | undefined,
  values: Record<string, unknown>,
) {
  const { db } = await context();
  const { error } = id
    ? await db.from(table).update(values).eq("id", id)
    : await db.from(table).insert(values);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${table.replaceAll("_", "-")}`);
}
async function syncRelations(
  table: string,
  column: string,
  id: string,
  values: string[],
) {
  const { db } = await context();
  const del = await db.from(table).delete().eq(column, id);
  if (del.error) throw new Error(del.error.message);
  if (values.length) {
    const rows = values.map((value, index) => ({
      [column]: id,
      technology_id: value,
      sort_order: index,
    }));
    const inserted = await db.from(table).insert(rows);
    if (inserted.error) throw new Error(inserted.error.message);
  }
}
export async function saveService(f: FormData) {
  const parsed = serviceSchema.parse({
    id: text(f, "id") || undefined,
    slug: text(f, "slug"),
    title_en: text(f, "title_en"),
    title_ar: text(f, "title_ar"),
    summary_en: text(f, "summary_en"),
    summary_ar: text(f, "summary_ar"),
    body_en: text(f, "body_en"),
    body_ar: text(f, "body_ar"),
    audience_en: text(f, "audience_en"),
    audience_ar: text(f, "audience_ar"),
    problems_en: text(f, "problems_en"),
    problems_ar: text(f, "problems_ar"),
    deliverables_en: text(f, "deliverables_en"),
    deliverables_ar: text(f, "deliverables_ar"),
    approach_en: text(f, "approach_en"),
    approach_ar: text(f, "approach_ar"),
    seo_title_en: text(f, "seo_title_en"),
    seo_title_ar: text(f, "seo_title_ar"),
    seo_description_en: text(f, "seo_description_en"),
    seo_description_ar: text(f, "seo_description_ar"),
    status: text(f, "status"),
    sort_order: num(f, "sort_order"),
  });
  const { id, ...v } = parsed;
  let recordId = id;
  if (recordId)
    await save("services", recordId, {
      ...v,
      published_at: v.status === "published" ? new Date().toISOString() : null,
    });
  else {
    const { db } = await context();
    const { data, error } = await db
      .from("services")
      .insert({
        ...v,
        published_at:
          v.status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    recordId = data.id;
  }
  await syncRelations(
    "service_technologies",
    "service_id",
    recordId!,
    f.getAll("technology_ids").map(String),
  );
  revalidatePath("/admin/services");
  revalidatePath("/en/services");
  revalidatePath("/ar/services");
}
export async function saveTechnology(f: FormData) {
  const p = technologySchema.parse({
    id: text(f, "id") || undefined,
    slug: text(f, "slug"),
    name: text(f, "name"),
    category: text(f, "category"),
    description_en: text(f, "description_en"),
    description_ar: text(f, "description_ar"),
    media_id: text(f, "media_id") || null,
    sort_order: num(f, "sort_order"),
    active: checked(f, "active"),
  });
  const { id, ...v } = p;
  await save("technologies", id, {
    ...v,
    status: v.active ? "published" : "archived",
  });
  revalidatePath("/en/technologies");
  revalidatePath("/ar/technologies");
}
export async function saveInsight(f: FormData) {
  const p = insightSchema.parse({
    id: text(f, "id") || undefined,
    slug: text(f, "slug"),
    title_en: text(f, "title_en"),
    title_ar: text(f, "title_ar"),
    excerpt_en: text(f, "excerpt_en"),
    excerpt_ar: text(f, "excerpt_ar"),
    content_en: text(f, "content_en"),
    content_ar: text(f, "content_ar"),
    category: text(f, "category"),
    author: text(f, "author"),
    cover_media_id: text(f, "cover_media_id") || null,
    seo_title_en: text(f, "seo_title_en"),
    seo_title_ar: text(f, "seo_title_ar"),
    seo_description_en: text(f, "seo_description_en"),
    seo_description_ar: text(f, "seo_description_ar"),
    status: text(f, "status"),
  });
  const { id, ...v } = p;
  await save("insights", id, {
    ...v,
    published_at: v.status === "published" ? new Date().toISOString() : null,
  });
  revalidatePath("/en/insights");
  revalidatePath("/ar/insights");
}
export async function saveTestimonial(f: FormData) {
  const p = testimonialSchema.parse({
    id: text(f, "id") || undefined,
    client_name: text(f, "client_name"),
    organization: text(f, "organization"),
    role: text(f, "role"),
    quote_en: text(f, "quote_en"),
    quote_ar: text(f, "quote_ar"),
    project_id: text(f, "project_id") || null,
    approved: checked(f, "approved"),
    status: text(f, "status"),
    sort_order: num(f, "sort_order"),
  });
  const { id, ...v } = p;
  await save("testimonials", id, {
    ...v,
    published_at: v.status === "published" ? new Date().toISOString() : null,
  });
}
export async function updateLeadStatus(f: FormData) {
  const { db } = await context();
  const status = text(f, "status");
  if (!/^(new|reviewing|contacted|qualified|won|lost|archived)$/.test(status))
    throw new Error("Invalid lead status");
  const { error } = await db
    .from("inquiries")
    .update({ status })
    .eq("id", text(f, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
}
export async function saveSetting(f: FormData) {
  const { db, user } = await context(true);
  const allowed = new Set([
      "company_name",
      "contact_email",
      "contact_phone",
      "social_link",
      "default_seo_title",
      "default_seo_description",
      "footer_content",
      "primary_cta",
      "business_status",
    ]),
    key = text(f, "key");
  if (!allowed.has(key)) throw new Error("Setting is not allowlisted");
  const { error } = await db.from("site_settings").upsert({
    key,
    value_en: text(f, "value_en"),
    value_ar: text(f, "value_ar"),
    public: true,
    updated_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
export async function saveJourneyStep(f: FormData) {
  const p = journeySchema.parse({
    case_study_id: text(f, "case_study_id"),
    title_en: text(f, "title_en"),
    title_ar: text(f, "title_ar"),
    description_en: text(f, "description_en"),
    description_ar: text(f, "description_ar"),
    step_type: text(f, "step_type") || "action",
    sort_order: num(f, "sort_order"),
  });
  await save("customer_journey_steps", text(f, "id") || undefined, p);
  revalidatePath(`/admin/projects/${text(f, "project_id")}/structure`);
}
export const addJourneyStep = saveJourneyStep;
export async function saveArchitectureNode(f: FormData) {
  const p = nodeSchema.parse({
    case_study_id: text(f, "case_study_id"),
    node_key: text(f, "node_key"),
    label_en: text(f, "label_en"),
    label_ar: text(f, "label_ar"),
    description_en: text(f, "description_en"),
    description_ar: text(f, "description_ar"),
    node_type: text(f, "node_type"),
    layer: num(f, "layer"),
    sort_order: num(f, "sort_order"),
  });
  await save("architecture_nodes", text(f, "id") || undefined, p);
  revalidatePath(`/admin/projects/${text(f, "project_id")}/structure`);
}
export const addArchitectureNode = saveArchitectureNode;
export async function addConnection(f: FormData) {
  const { db } = await context();
  const caseId = text(f, "case_study_id"),
    source = text(f, "source_node_id"),
    target = text(f, "target_node_id");
  if (!caseId || !source || !target || source === target)
    throw new Error("Invalid connection");
  const { error } = await db.from("architecture_connections").insert({
    case_study_id: caseId,
    source_node_id: source,
    target_node_id: target,
  });
  if (error)
    throw new Error(
      error.code === "23505" ? "That connection already exists" : error.message,
    );
  revalidatePath(`/admin/projects/${text(f, "project_id")}/structure`);
}
export async function saveResult(f: FormData) {
  const p = resultSchema.parse({
    project_id: text(f, "project_id"),
    label_en: text(f, "label_en"),
    label_ar: text(f, "label_ar"),
    value: text(f, "value"),
    context_en: text(f, "context_en"),
    context_ar: text(f, "context_ar"),
    verified: checked(f, "verified"),
    publishable: checked(f, "publishable"),
    source_note: text(f, "source_note"),
    sort_order: num(f, "sort_order"),
  });
  await save("project_results", text(f, "id") || undefined, p);
  revalidatePath(`/admin/projects/${p.project_id}/structure`);
}
export const addResult = saveResult;
export async function deleteRecord(f: FormData) {
  const table = text(f, "table"),
    id = text(f, "id"),
    returnPath = text(f, "return_path"),
    confirmation = text(f, "confirmation");
  const allowed = new Set([
    "projects",
    "services",
    "technologies",
    "testimonials",
    "insights",
    "customer_journey_steps",
    "architecture_nodes",
    "architecture_connections",
    "project_results",
  ]);
  if (!allowed.has(table) || confirmation !== "DELETE")
    throw new Error("Deletion was not confirmed");
  const { db } = await context();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error)
    throw new Error(
      error.code === "23503"
        ? "Remove related records before deletion"
        : error.message,
    );
  revalidatePath(returnPath);
}
export async function moveRecord(f: FormData) {
  const table = text(f, "table"),
    id = text(f, "id"),
    direction = text(f, "direction"),
    returnPath = text(f, "return_path");
  const allowed = new Set([
    "projects",
    "services",
    "technologies",
    "testimonials",
    "customer_journey_steps",
    "architecture_nodes",
    "architecture_connections",
    "project_results",
  ]);
  if (!allowed.has(table) || !["up", "down"].includes(direction))
    throw new Error("Invalid reorder request");
  const { db } = await context();
  const current = await db
    .from(table)
    .select("id,sort_order")
    .eq("id", id)
    .single();
  if (current.error) throw new Error(current.error.message);
  let q = db.from(table).select("id,sort_order").neq("id", id);
  const caseStudy = text(f, "case_study_id"),
    project = text(f, "project_id");
  if (caseStudy) q = q.eq("case_study_id", caseStudy);
  if (project) q = q.eq("project_id", project);
  q =
    direction === "up"
      ? q
          .lt("sort_order", current.data.sort_order)
          .order("sort_order", { ascending: false })
      : q.gt("sort_order", current.data.sort_order).order("sort_order");
  const other = await q.limit(1).maybeSingle();
  if (other.data)
    await Promise.all([
      db.from(table).update({ sort_order: other.data.sort_order }).eq("id", id),
      db
        .from(table)
        .update({ sort_order: current.data.sort_order })
        .eq("id", other.data.id),
    ]);
  revalidatePath(returnPath);
}
export async function saveProjectRelations(f: FormData) {
  const id = text(f, "project_id");
  await syncRelations(
    "project_technologies",
    "project_id",
    id,
    f.getAll("technology_ids").map(String),
  );
  const { db } = await context();
  await db
    .from("testimonials")
    .update({ project_id: null })
    .eq("project_id", id);
  const testimonial = text(f, "testimonial_id");
  if (testimonial)
    await db
      .from("testimonials")
      .update({ project_id: id })
      .eq("id", testimonial);
  revalidatePath(`/admin/projects/${id}`);
}
export async function saveProjectMedia(f: FormData) {
  const { db } = await context();
  const projectId = text(f, "project_id"),
    mediaIds = f.getAll("media_ids").map(String);
  const removed = await db
    .from("project_media")
    .delete()
    .eq("project_id", projectId);
  if (removed.error) throw new Error(removed.error.message);
  if (mediaIds.length) {
    const { error } = await db
      .from("project_media")
      .insert(
        mediaIds.map((media_id, sort_order) => ({
          project_id: projectId,
          media_id,
          role: "gallery",
          sort_order,
        })),
      );
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}
export async function uploadMedia(f: FormData) {
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0)
    throw new Error("Choose a file");
  const allowed = new Map([
      ["image/jpeg", [".jpg", ".jpeg"]],
      ["image/png", [".png"]],
      ["image/webp", [".webp"]],
      ["image/avif", [".avif"]],
    ]),
    extensions = allowed.get(file.type),
    ext = path.extname(file.name).toLowerCase();
  if (!extensions?.includes(ext) || file.size > 10 * 1024 * 1024)
    throw new Error("Unsupported media type, extension, or size");
  const bytes = Buffer.from(await file.arrayBuffer()),
    meta = await sharp(bytes).metadata();
  if (!meta.width || !meta.height || meta.width > 12000 || meta.height > 12000)
    throw new Error("Invalid image dimensions");
  const { db, user } = await context(),
    storagePath = `${user.id}/${randomUUID()}${ext}`;
  const uploaded = await db.storage
    .from("private-media")
    .upload(storagePath, bytes, { contentType: file.type });
  if (uploaded.error) throw new Error(uploaded.error.message);
  const row = await db.from("media").insert({
    storage_path: storagePath,
    original_filename: path.basename(file.name),
    mime_type: file.type,
    byte_size: file.size,
    width: meta.width,
    height: meta.height,
    alt_en: text(f, "alt_en"),
    alt_ar: text(f, "alt_ar"),
    status: "draft",
    created_by: user.id,
  });
  if (row.error) {
    await db.storage.from("private-media").remove([storagePath]);
    throw new Error(row.error.message);
  }
  revalidatePath("/admin/media");
}
export async function updateMedia(f: FormData) {
  const { db } = await context();
  const id = text(f, "id"),
    storagePath = text(f, "storage_path"),
    status = text(f, "status");
  if (!["draft", "published", "archived"].includes(status))
    throw new Error("Invalid media status");
  if (status === "published") {
    const source = await db.storage.from("private-media").download(storagePath);
    if (source.error) throw new Error(source.error.message);
    const copied = await db.storage
      .from("public-media")
      .upload(storagePath, source.data, {
        upsert: true,
        contentType: text(f, "mime_type"),
      });
    if (copied.error) throw new Error(copied.error.message);
  } else await db.storage.from("public-media").remove([storagePath]);
  const { error } = await db
    .from("media")
    .update({ alt_en: text(f, "alt_en"), alt_ar: text(f, "alt_ar"), status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}
export async function deleteMedia(f: FormData) {
  if (text(f, "confirmation") !== "DELETE")
    throw new Error("Deletion was not confirmed");
  const { db } = await context();
  const id = text(f, "id"),
    storagePath = text(f, "storage_path");
  const { error } = await db.from("media").delete().eq("id", id);
  if (error)
    throw new Error(
      error.code === "23503" ? "Media is still referenced" : error.message,
    );
  await Promise.all([
    db.storage.from("private-media").remove([storagePath]),
    db.storage.from("public-media").remove([storagePath]),
  ]);
  revalidatePath("/admin/media");
}
