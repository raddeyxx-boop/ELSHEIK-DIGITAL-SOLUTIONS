import { HeroPixelBackground } from "@/components/backgrounds/hero-pixel-background";
﻿import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getPublishedInsights } from "@/server/queries/public-content";
import { InsightsIndex } from "@/components/insights/insights-index";
import { JournalCTA, journalCopy } from "@/components/insights/journal";
import { isPublicEditorialInsight } from "@/lib/insights/publication";
import styles from "@/components/insights/journal.module.css";

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
  if (!isLocale(locale)) return {};
  return {
    title: journalCopy[locale].label,
    description: journalCopy[locale].intro,
    alternates: {
      canonical: `/${locale}/insights`,
      languages: { en: "/en/insights", ar: "/ar/insights" },
    },
  };
}
export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const records = await getPublishedInsights(locale),
    items = records?.filter(isPublicEditorialInsight) ?? records,
    l = journalCopy[locale];
  return (
    <div
      className={`${styles.journal} shell`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <header className={styles.hero} data-pixel-hero="insights"><HeroPixelBackground preset="insights" />
        <div>
          <span className={styles.kicker}>{l.label}</span>
          <h1>{l.title}</h1>
          <p className={styles.positioning}>{l.positioning}</p>
          <p>{l.intro}</p>
        </div>
        <aside>
          <span className={styles.signal} aria-hidden="true" />
          <p>{l.note}</p>
          <span className={styles.disciplines}>{l.disciplines}</span>
        </aside>
      </header>
      <section className={styles.topics} aria-labelledby="journal-topics">
        <h2 id="journal-topics">{l.topicsLabel}</h2>
        <ul>{l.topics.map(([name, description], index) => <li key={name}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong><p>{description}</p></li>)}</ul>
      </section>
      {items?.length ? (
        <InsightsIndex items={items} locale={locale} />
      ) : (
        <section className={styles.empty}>
          <div>
            <span className={styles.kicker}>{l.label}</span>
            <h2>{items === null ? l.unavailable : l.empty}</h2>
            <p>{items === null ? l.retry : l.emptyText}</p>
            <Link href={`/${locale}/work`}>
              {l.work}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.emptyArt} aria-hidden="true">
            <span>ELS / JOURNAL</span>
            <i />
            <i />
            <i />
            <b>↗</b>
          </div>
        </section>
      )}
      <JournalCTA locale={locale} />
    </div>
  );
}
