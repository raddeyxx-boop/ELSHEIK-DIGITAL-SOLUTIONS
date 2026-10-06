import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Homepage, HomepageHero } from "@/components/sections/homepage";
import Loading from './loading';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from "@/content/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import {
  getPublishedProjects,
  getPublishedServices,
} from "@/server/queries/public-content";

// Statically generated and fully prefetchable: CMS reads carry no visitor cookies.
// Admin saves revalidate on demand (revalidatePublicSite); this is the fallback for
// changes made outside the admin and for recovering from a CMS outage.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ar"
        ? "شركة الشيخ للحلول الرقمية"
        : "Alsheikh Digital Solutions",
    description:
      locale === "ar"
        ? "مواقع وتطبيقات وأتمتة وأنظمة رقمية ذكية مصممة لأعمال حقيقية."
        : "Websites, applications, automation, and intelligent systems engineered for real business.",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
  };
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  return <>
    <HomepageHero locale={locale} dictionary={dictionary} />
    <Suspense fallback={<Loading />}>
      <HomepageContent locale={locale} />
    </Suspense>
  </>;
}

async function HomepageContent({ locale }: { locale: Locale }) {
  const [live, services] = await Promise.all([
    getPublishedProjects(locale),
    getPublishedServices(locale),
  ]);
  const dictionary = getDictionary(locale);
  // Same showcase fallback as the Work page and the case study: without it a CMS
  // outage removes Selected Work's project and the featured case study from Home.
  const projects = live?.length
    ? live
    : [{ slug: "relax-moon-spa-automation", title: dictionary.work.name, summary: dictionary.work.summary, industry: dictionary.work.industry, year: dictionary.work.year, isDemo: true }];
  return (
    <Homepage
      locale={locale}
      showHero={false}
      dictionary={dictionary}
      projects={projects}
      services={services || []}
    />
  );
}
