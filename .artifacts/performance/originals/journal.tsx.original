import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicInsightSummary } from "@/lib/insights/publication";
import styles from "./journal.module.css";

export const journalCopy = {
  en: {
    label: "INSIGHTS",
    title: "Ideas for better digital systems.",
    intro:
      "Engineering notes, automation patterns and product thinking from building software for real operations.",
    note: "Research, engineering and operational thinking from ELSHEIK.",
    disciplines: "Engineering / Automation / Product / Systems",
    empty: "New engineering notes are being prepared.",
    emptyText: "Explore our work while new articles are being published.",
    work: "Explore Work",
    cta: "Put better thinking to work.",
    ctaText:
      "Have a system to improve or a product to build? Let’s talk about what comes next.",
    contact: "Start a conversation",
    back: "All insights",
    related: "Continue reading",
    unavailable: "Insights are temporarily unavailable.",
    retry: "Please check back shortly, or explore our work.",
    positioning: "An engineering, product and automation journal.",
    topicsLabel: "WHAT THE JOURNAL COVERS",
    topics: [
      ["Systems engineering", "How software is structured so it stays understandable as it grows."],
      ["Automation", "Workflow orchestration, state, and the line between automated and human work."],
      ["Product engineering", "Turning operational problems into product decisions."],
      ["Integrations", "Connecting channels, data and schedules through clear boundaries."],
      ["User experience", "Interfaces that make complex operations legible."],
      ["Reliability", "Validation, failure paths, and systems that degrade honestly."],
      ["Technical studies", "Close readings of real implementations and their trade-offs."],
    ],
  },
  ar: {
    label: "رؤى وأفكار",
    title: "أفكار تبني أنظمة رقمية أفضل.",
    intro:
      "ملاحظات هندسية، وأنماط أتمتة، ورؤى في تصميم المنتجات من تجربة بناء برمجيات تخدم العمليات الفعلية.",
    note: "أبحاث ورؤى هندسية وتشغيلية من الشيخ للحلول الرقمية.",
    disciplines: "الهندسة / الأتمتة / المنتجات / الأنظمة",
    empty: "نعمل على إعداد رؤى هندسية جديدة.",
    emptyText: "اكتشف أعمالنا ريثما ننشر مقالاتنا الجديدة.",
    work: "استكشف أعمالنا",
    cta: "لنحوّل الأفكار إلى أنظمة تعمل.",
    ctaText: "هل تريد تطوير نظام أو بناء منتج؟ لنتحدث عن خطوتك القادمة.",
    contact: "ابدأ الحوار",
    back: "جميع المقالات",
    related: "تابع القراءة",
    unavailable: "المقالات غير متاحة مؤقتًا.",
    retry: "يرجى العودة قريبًا، أو استكشاف أعمالنا.",
    positioning: "مجلة في الهندسة والمنتجات والأتمتة.",
    topicsLabel: "ما تتناوله المجلة",
    topics: [
      ["هندسة الأنظمة", "كيف تُبنى البرمجيات لتبقى مفهومة كلما كبرت."],
      ["الأتمتة", "تنسيق مسارات العمل، وإدارة الحالة، والحد الفاصل بين العمل المؤتمت والبشري."],
      ["هندسة المنتجات", "تحويل مشكلات التشغيل إلى قرارات منتج."],
      ["التكاملات", "ربط القنوات والبيانات والمواعيد عبر حدود واضحة."],
      ["تجربة المستخدم", "واجهات تجعل العمليات المعقدة مقروءة."],
      ["الاعتمادية", "التحقق من البيانات، ومسارات الفشل، وأنظمة تتعامل مع الأعطال بوضوح."],
      ["دراسات تقنية", "قراءات متأنية في تطبيقات حقيقية وموازناتها."],
    ],
  },
};
export function InsightVisual({ item }: { item: PublicInsightSummary }) {
  return item.cover ? (
    <div className={styles.cover}>
      {/* CMS URLs are served directly from public storage. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.cover.url} alt={item.cover.alt} />
    </div>
  ) : (
    <div className={styles.visual} aria-hidden="true">
      <span>ELS / {item.category || "INSIGHTS"}</span>
      <div className={styles.geometry}>
        <i />
        <i />
        <i />
        <i />
      </div>
      <b>{item.category}</b>
    </div>
  );
}
export function JournalCTA({ locale }: { locale: Locale }) {
  const l = journalCopy[locale];
  return (
    <aside className={styles.cta}>
      <div>
        <span className={styles.kicker}>ELSHEIK / DIGITAL SOLUTIONS</span>
        <h2>{l.cta}</h2>
        <p>{l.ctaText}</p>
      </div>
      <Link href={`/${locale}/contact`}>
        {l.contact}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </aside>
  );
}
export function insightDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    calendar: "gregory",
    timeZone: "UTC",
  }).format(new Date(value));
}
