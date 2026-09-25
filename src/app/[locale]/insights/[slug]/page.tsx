import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import {
  getPublishedInsight,
  getPublishedInsights,
} from "@/server/queries/public-content";
import {
  InsightVisual,
  JournalCTA,
  journalCopy,
  insightDate,
} from "@/components/insights/journal";
import styles from "@/components/insights/journal.module.css";
import { isPublicEditorialInsight } from "@/lib/insights/publication";
import { getAdminSession } from "@/lib/auth/admin";

// Rendered per request so a CMS failure reaches the in-site error boundary (a
// statically generated path cannot render it), and so the admin preview of
// non-editorial records can read the session.
export const dynamic = "force-dynamic";

async function canReadPublicInsight(item: { title: string; excerpt: string; category: string }) {
  if (isPublicEditorialInsight(item)) return true;
  const session = await getAdminSession();
  return Boolean(session.user && session.role);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const item = await getPublishedInsight(slug, locale);
  if (!item || !(await canReadPublicInsight(item))) return {};
  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.excerpt,
    alternates: {
      canonical: `/${locale}/insights/${slug}`,
      languages: { en: `/en/insights/${slug}`, ar: `/ar/insights/${slug}` },
    },
    openGraph: {
      type: "article",
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.excerpt,
      ...(item.publishedAt ? { publishedTime: item.publishedAt } : {}),
      ...(item.cover
        ? { images: [{ url: item.cover.url, alt: item.cover.alt }] }
        : {}),
    },
  };
}
// The CMS stores plain text. Support a small, safe set of block conventions;
// React escapes all content, including HTML and code supplied by editors.
function ArticleBody({ content }: { content: string }) {
  return content
    .replace(/\r\n/g, "\n")
    .split(/(```[\s\S]*?```)/g)
    .map((part, i) =>
      part.startsWith("```") ? (
        <pre key={i}>
          <code>{part.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")}</code>
        </pre>
      ) : (
        part
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((block, j) => {
            const key = `${i}-${j}`;
            if (/^### /.test(block)) return <h3 key={key}>{block.slice(4)}</h3>;
            if (/^## /.test(block)) return <h2 key={key}>{block.slice(3)}</h2>;
            if (/^> /.test(block))
              return (
                <blockquote key={key}>{block.replace(/^> /gm, "")}</blockquote>
              );
            if (block.split("\n").every((line) => /^[-*] /.test(line)))
              return (
                <ul key={key}>
                  {block.split("\n").map((line, k) => (
                    <li key={k}>{line.slice(2)}</li>
                  ))}
                </ul>
              );
            return <p key={key}>{block}</p>;
          })
      ),
    );
}
export default async function InsightPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const item = await getPublishedInsight(slug, locale);
  if (!item || !(await canReadPublicInsight(item))) notFound();
  const related = ((await getPublishedInsights(locale)) || [])
      .filter((other) => other.slug !== slug && isPublicEditorialInsight(other))
      .sort(
        (a, b) =>
          Number(b.category === item.category) -
          Number(a.category === item.category),
      )
      .slice(0, 3),
    l = journalCopy[locale];
  return (
    <div
      className={`${styles.journal} shell`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <article>
        <header className={styles.readerHeader}>
          <Link className={styles.back} href={`/${locale}/insights`}>
            {l.back}
          </Link>
          <div className={styles.meta}>
            {item.category && <span>{item.category}</span>}
            {item.publishedAt && (
              <time dateTime={item.publishedAt}>
                {insightDate(item.publishedAt, locale)}
              </time>
            )}
            {item.author && <span>{item.author}</span>}
          </div>
          <h1>{item.title}</h1>
          {item.excerpt && <p className={styles.deck}>{item.excerpt}</p>}
        </header>
        <div className={styles.readerVisual}>
          <InsightVisual item={item} />
        </div>
        <div className={styles.body}>
          <ArticleBody content={item.content} />
        </div>
      </article>
      {related.length > 0 && (
        <section className={styles.related}>
          <h2>{l.related}</h2>
          {related.map((other) => (
            <Link key={other.slug} href={`/${locale}/insights/${other.slug}`}>
              {other.title}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}
      <JournalCTA locale={locale} />
    </div>
  );
}
