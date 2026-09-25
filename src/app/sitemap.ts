import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getPublishedInsights } from "@/server/queries/public-content";
import { isPublicEditorialInsight } from "@/lib/insights/publication";

// Published insights come from the CMS; refreshed like the public pages (admin saves
// revalidate it on demand, see revalidatePublicSite).
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "about", "services", "work", "process", "technologies", "insights", "contact"];
  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => routes.map((route) => ({
    url: `${base}/${locale}${route ? `/${route}` : ""}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  })));
  const collections = await Promise.all(locales.map(async (locale) => ({ locale, items: (await getPublishedInsights(locale)) || [] })));
  const insightRoutes: MetadataRoute.Sitemap = collections.flatMap(({ locale, items }) => items.filter(isPublicEditorialInsight).map((item) => ({
    url: `${base}/${locale}/insights/${item.slug}`,
    lastModified: item.publishedAt ? new Date(item.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  })));
  return [...staticRoutes, ...insightRoutes];
}
