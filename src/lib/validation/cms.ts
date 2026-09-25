import { z } from "zod";
const slug = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const status = z.enum(["draft", "published", "archived"]);
export const serviceSchema = z.object({
  id: z.uuid().optional(),
  slug,
  title_en: z.string().min(2).max(160),
  title_ar: z.string().min(2).max(160),
  summary_en: z.string().min(10).max(600),
  summary_ar: z.string().min(10).max(600),
  body_en: z.string().max(10000),
  body_ar: z.string().max(10000),
  audience_en: z.string().max(2000),
  audience_ar: z.string().max(2000),
  problems_en: z.string().max(3000),
  problems_ar: z.string().max(3000),
  deliverables_en: z.string().max(3000),
  deliverables_ar: z.string().max(3000),
  approach_en: z.string().max(3000),
  approach_ar: z.string().max(3000),
  seo_title_en: z.string().max(160),
  seo_title_ar: z.string().max(160),
  seo_description_en: z.string().max(320),
  seo_description_ar: z.string().max(320),
  status,
  sort_order: z.number().int().nonnegative(),
});
export const technologySchema = z.object({
  id: z.uuid().optional(),
  slug,
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(80),
  description_en: z.string().max(500),
  description_ar: z.string().max(500),
  media_id: z.uuid().nullable(),
  sort_order: z.number().int().nonnegative(),
  active: z.boolean(),
});
export const insightSchema = z.object({
  id: z.uuid().optional(),
  slug,
  title_en: z.string().min(2).max(180),
  title_ar: z.string().min(2).max(180),
  excerpt_en: z.string().min(10).max(600),
  excerpt_ar: z.string().min(10).max(600),
  content_en: z.string().min(20).max(50000),
  content_ar: z.string().min(20).max(50000),
  category: z.string().min(1).max(80),
  author: z.string().max(120),
  cover_media_id: z.uuid().nullable(),
  seo_title_en: z.string().max(160),
  seo_title_ar: z.string().max(160),
  seo_description_en: z.string().max(320),
  seo_description_ar: z.string().max(320),
  status,
});
export const testimonialSchema = z
  .object({
    id: z.uuid().optional(),
    client_name: z.string().min(2).max(120),
    organization: z.string().max(120),
    role: z.string().max(120),
    quote_en: z.string().min(10).max(2000),
    quote_ar: z.string().max(2000),
    project_id: z.uuid().nullable(),
    approved: z.boolean(),
    status,
    sort_order: z.number().int().nonnegative(),
  })
  .superRefine((value, context) => {
    if (value.status === "published" && !value.approved)
      context.addIssue({
        code: "custom",
        message: "A testimonial must be approved before publication",
        path: ["approved"],
      });
  });
export const journeySchema = z.object({
  case_study_id: z.uuid(),
  title_en: z.string().min(1).max(160),
  title_ar: z.string().min(1).max(160),
  description_en: z.string().max(1000),
  description_ar: z.string().max(1000),
  step_type: z.string().max(50),
  sort_order: z.number().int().nonnegative(),
});
export const nodeSchema = z.object({
  case_study_id: z.uuid(),
  node_key: slug,
  label_en: z.string().min(1).max(120),
  label_ar: z.string().min(1).max(120),
  description_en: z.string().max(1000),
  description_ar: z.string().max(1000),
  node_type: z.enum([
    "channel",
    "integration",
    "automation",
    "logic",
    "service",
    "output",
    "custom",
  ]),
  layer: z.number().int().nonnegative(),
  sort_order: z.number().int().nonnegative(),
});
export const resultSchema = z.object({
  project_id: z.uuid(),
  label_en: z.string().min(1).max(120),
  label_ar: z.string().min(1).max(120),
  value: z.string().max(120),
  context_en: z.string().max(1000),
  context_ar: z.string().max(1000),
  verified: z.boolean(),
  publishable: z.boolean(),
  source_note: z.string().max(2000),
  sort_order: z.number().int().nonnegative(),
});
