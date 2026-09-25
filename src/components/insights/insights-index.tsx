"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicInsightSummary } from "@/lib/insights/publication";
import { InsightVisual, insightDate } from "./journal";
import styles from "./insights-index.module.css";
const labels = {
  en: {
    all: "All",
    latest: "LATEST THINKING",
    featured: "LATEST INSIGHT",
    read: "Read Insight",
    search: "Search insights",
    noMatch: "No insights match this selection.",
    reset: "Clear filters",
    categories: "Insight categories",
  },
  ar: {
    all: "الكل",
    latest: "أحدث الأفكار",
    featured: "أحدث مقال",
    read: "اقرأ المقال",
    search: "ابحث في المقالات",
    noMatch: "لا توجد مقالات تطابق هذا الاختيار.",
    reset: "إلغاء التصفية",
    categories: "تصنيفات المقالات",
  },
};
export function InsightsIndex({
  items,
  locale,
}: {
  items: PublicInsightSummary[];
  locale: Locale;
}) {
  const l = labels[locale],
    [category, setCategory] = useState<string | null>(null),
    [query, setQuery] = useState("");
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items],
  );
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === null || item.category === category) &&
          `${item.title} ${item.excerpt} ${item.category}`
            .toLocaleLowerCase(locale)
            .includes(query.trim().toLocaleLowerCase(locale)),
      ),
    [items, category, query, locale],
  );
  const featured = items[0];
  if (!featured) return null;
  return (
    <>
      <article className={styles.featured}>
        <div className={styles.featureMeta}>
          <span>{l.featured}</span>
          <div>
            {featured.category && <span>{featured.category}</span>}
            {featured.publishedAt && (
              <time dateTime={featured.publishedAt}>
                {insightDate(featured.publishedAt, locale)}
              </time>
            )}
          </div>
        </div>
        <div className={styles.featureCopy}>
          <h2>
            <Link href={`/${locale}/insights/${featured.slug}`}>
              {featured.title}
            </Link>
          </h2>
          {featured.excerpt && <p>{featured.excerpt}</p>}
          <Link
            className={styles.read}
            href={`/${locale}/insights/${featured.slug}`}
          >
            {l.read}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <InsightVisual item={featured} />
      </article>
      <section className={styles.index} aria-labelledby="insight-index">
        <header>
          <h2 id="insight-index">{l.latest}</h2>
          <span>{String(items.length).padStart(2, "0")}</span>
        </header>
        <div className={styles.controls}>
          {categories.length > 1 && (
            <div
              className={styles.filters}
              role="group"
              aria-label={l.categories}
            >
              <button
                type="button"
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                {l.all}
              </button>
              {categories.map((item) => (
                <button
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {items.length >= 5 && (
            <label className={styles.search}>
              <Search aria-hidden="true" />
              <span className="sr-only">{l.search}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={l.search}
              />
            </label>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {filtered.length} {l.latest}
        </div>
        {filtered.map((item) => (
          <article key={item.slug}>
            <span className={styles.number}>
              {String(items.indexOf(item) + 1).padStart(2, "0")}
            </span>
            <div className={styles.rowMeta}>
              {item.category && <b>{item.category}</b>}
              {item.publishedAt && (
                <time dateTime={item.publishedAt}>
                  {insightDate(item.publishedAt, locale)}
                </time>
              )}
            </div>
            <div className={styles.rowCopy}>
              <h3>
                <Link href={`/${locale}/insights/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>
              {item.excerpt && <p>{item.excerpt}</p>}
            </div>
            <Link
              className={styles.rowArrow}
              aria-label={`${l.read}: ${item.title}`}
              href={`/${locale}/insights/${item.slug}`}
            >
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className={styles.noMatch}>
            <p>{l.noMatch}</p>
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setQuery("");
              }}
            >
              {l.reset}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
