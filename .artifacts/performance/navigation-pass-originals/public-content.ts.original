import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { availabilityAwareOptions } from "@/lib/supabase/availability";
import type { Locale } from "@/lib/i18n/config";

// A read the CMS could not answer (network, server or query error), as opposed
// to a record that does not exist; callers must not turn it into a 404.
export class CmsReadError extends Error {
  name = "CmsReadError";
}

const localized = (locale: Locale, en: string | null, ar: string | null) =>
  locale === "ar" ? ar || en || "" : en || ar || "";
function insightCover(
  c: NonNullable<ReturnType<typeof createPublicClient>>,
  value: unknown,
  locale: Locale,
) {
  const media = (Array.isArray(value) ? value[0] : value) as {
    storage_path: string;
    alt_en: string | null;
    alt_ar: string | null;
    mime_type: string;
    status: string;
  } | null;
  if (
    !media ||
    media.status !== "published" ||
    !media.mime_type.startsWith("image/")
  )
    return null;
  return {
    url: c.storage.from("public-media").getPublicUrl(media.storage_path).data
      .publicUrl,
    alt: localized(locale, media.alt_en, media.alt_ar),
  };
}
export async function getPublishedServices(locale: Locale) {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data, error } = await c
    .from("services")
    .select(
      "id,slug,title_en,title_ar,summary_en,summary_ar,outcome_en,outcome_ar,sort_order",
    )
    .eq("status", "published")
    .order("sort_order");
  return error
    ? null
    : data.map((r) => ({
        id: r.slug,
        title: localized(locale, r.title_en, r.title_ar),
        body: localized(locale, r.summary_en, r.summary_ar),
        outcome: localized(locale, r.outcome_en, r.outcome_ar),
        tech: "",
      }));
}
export async function getPublishedProjects(locale: Locale) {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data, error } = await c
    .from("projects")
    .select(
      "id,slug,title_en,title_ar,summary_en,summary_ar,industry_en,industry_ar,year,is_demo",
    )
    .eq("status", "published")
    .order("sort_order");
  return error
    ? null
    : data.map((r) => ({
        slug: r.slug,
        title: localized(locale, r.title_en, r.title_ar),
        summary: localized(locale, r.summary_en, r.summary_ar),
        industry: localized(locale, r.industry_en, r.industry_ar),
        year: r.year || "",
        isDemo: r.is_demo,
      }));
}
export async function getPublishedTechnologies() {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data, error } = await c
    .from("technologies")
    .select("id,name,category,sort_order")
    .eq("status", "published")
    .eq("active", true)
    .order("sort_order");
  return error ? null : data;
}
export async function getPublishedInsights(locale: Locale) {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data, error } = await c
    .from("insights")
    .select(
      "id,slug,title_en,title_ar,excerpt_en,excerpt_ar,category,published_at,media!cover_media_id(storage_path,alt_en,alt_ar,mime_type,status)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return error
    ? null
    : data.map((r) => ({
        slug: r.slug,
        title: localized(locale, r.title_en, r.title_ar),
        excerpt: localized(locale, r.excerpt_en, r.excerpt_ar),
        category: r.category,
        publishedAt: r.published_at,
        cover: insightCover(c, r.media, locale),
      }));
}
// Cached per request: generateMetadata and the page share one query.
export const getPublishedInsight = cache(async (slug: string, locale: Locale) => {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data, error } = await c
    .from("insights")
    .select(
      "slug,title_en,title_ar,excerpt_en,excerpt_ar,content_en,content_ar,category,author,published_at,seo_title_en,seo_title_ar,seo_description_en,seo_description_ar,media!cover_media_id(storage_path,alt_en,alt_ar,mime_type,status)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new CmsReadError(error.message);
  if (!data) return null;
  return {
    slug: data.slug,
    title: localized(locale, data.title_en, data.title_ar),
    excerpt: localized(locale, data.excerpt_en, data.excerpt_ar),
    content: localized(locale, data.content_en, data.content_ar),
    category: data.category,
    author: data.author || "",
    publishedAt: data.published_at,
    cover: insightCover(c, data.media, locale),
    seoTitle: localized(locale, data.seo_title_en, data.seo_title_ar),
    seoDescription: localized(
      locale,
      data.seo_description_en,
      data.seo_description_ar,
    ),
  };
});
export const getPublishedCaseStudy = cache(async (slug: string, locale: Locale) => {
  const c = createPublicClient(availabilityAwareOptions());
  if (!c) return null;
  const { data: p, error } = await c
    .from("projects")
    .select(
      "id,slug,title_en,title_ar,summary_en,summary_ar,industry_en,industry_ar,year,is_demo,seo_title_en,seo_title_ar,seo_description_en,seo_description_ar,canonical_url",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new CmsReadError(error.message);
  if (!p) return null;
  const { data: s } = await c
    .from("case_studies")
    .select(
      "id,overview_en,overview_ar,challenge_en,challenge_ar,objectives_en,objectives_ar,solution_en,solution_ar,security_en,security_ar",
    )
    .eq("project_id", p.id)
    .eq("status", "published")
    .maybeSingle();
  const [j, n, e, r, t, q] = await Promise.all([
    s
      ? c
          .from("customer_journey_steps")
          .select("*")
          .eq("case_study_id", s.id)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
    s
      ? c
          .from("architecture_nodes")
          .select("*")
          .eq("case_study_id", s.id)
          .order("layer")
          .order("sort_order")
      : Promise.resolve({ data: [] }),
    s
      ? c
          .from("architecture_connections")
          .select("source_node_id,target_node_id")
          .eq("case_study_id", s.id)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
    c
      .from("project_results")
      .select("*")
      .eq("project_id", p.id)
      .eq("verified", true)
      .eq("publishable", true)
      .order("sort_order"),
    c
      .from("project_technologies")
      .select("sort_order,technologies(name,category)")
      .eq("project_id", p.id)
      .order("sort_order"),
    c
      .from("testimonials")
      .select("*")
      .eq("project_id", p.id)
      .eq("status", "published")
      .eq("approved", true)
      .order("sort_order"),
  ]);
  return {
    project: {
      title: localized(locale, p.title_en, p.title_ar),
      summary: localized(locale, p.summary_en, p.summary_ar),
      industry: localized(locale, p.industry_en, p.industry_ar),
      year: p.year || "",
      isDemo: p.is_demo,
      seoTitle: localized(locale, p.seo_title_en, p.seo_title_ar),
      seoDescription: localized(
        locale,
        p.seo_description_en,
        p.seo_description_ar,
      ),
      canonicalUrl: p.canonical_url,
    },
    sections: s
      ? [
          {
            key: "overview",
            value: localized(locale, s.overview_en, s.overview_ar),
          },
          {
            key: "challenge",
            value: localized(locale, s.challenge_en, s.challenge_ar),
          },
          {
            key: "objectives",
            value: localized(locale, s.objectives_en, s.objectives_ar),
          },
          {
            key: "solution",
            value: localized(locale, s.solution_en, s.solution_ar),
          },
          {
            key: "security",
            value: localized(locale, s.security_en, s.security_ar),
          },
        ].filter((x) => x.value)
      : [],
    journey: (j.data || []).map((x) => ({
      title: localized(locale, x.title_en, x.title_ar),
      description: localized(locale, x.description_en, x.description_ar),
      type: x.step_type,
    })),
    nodes: (n.data || []).map((x) => ({
      id: x.id,
      label: localized(locale, x.label_en, x.label_ar),
      description:
        localized(locale, x.description_en, x.description_ar) ||
        localized(locale, x.label_en, x.label_ar),
      type: x.node_type,
      layer: x.layer,
    })),
    connections: (e.data || []).map((x) => ({
      source: x.source_node_id,
      target: x.target_node_id,
    })),
    results: (r.data || []).map((x) => ({
      label: localized(locale, x.label_en, x.label_ar),
      value: x.value || "",
      context: localized(locale, x.context_en, x.context_ar),
    })),
    technologies: (t.data || []).map((x) => x.technologies).filter(Boolean),
    testimonials: (q.data || []).map((x) => ({
      name: x.client_name,
      role: x.role || "",
      organization: x.organization || "",
      quote: localized(locale, x.quote_en, x.quote_ar),
    })),
  };
});
