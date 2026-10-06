import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/page-hero";
import { SystemFlow } from "@/components/live/system-flow";
import { getDictionary } from "@/content/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { getPublishedProjects } from "@/server/queries/public-content";
import shared from "@/components/sections/page.module.css";
import styles from "./work-page.module.css";

// Statically generated and fully prefetchable: CMS reads carry no visitor cookies.
// Admin saves revalidate on demand (revalidatePublicSite); this is the fallback for
// changes made outside the admin and for recovering from a CMS outage.
export const revalidate = 60;

const content = {
  en: {
    eyebrow: "SELECTED WORK",
    title: "Systems explained through the work they improve.",
    lead: "Real-world digital systems presented through their business journey, customer experience, and sanitized technical architecture.",
    category: "SERVICE OPERATIONS",
    titleProject: "Relax Moon Spa",
    subtitle: "WhatsApp Booking & Operations Automation",
    description:
      "A conversational booking and operations platform built for a mobile spa service operating across Riyadh and Al Sharqiyah, Saudi Arabia.",
    detail:
      "The system guides customers from their first WhatsApp message through service selection, date and time selection, location details, availability checking, specialist assignment, booking confirmation, rescheduling, cancellation, and operational notifications.",
    coordinates: "WHAT THE SYSTEM COORDINATES",
    items: [
      "WhatsApp Booking",
      "Availability",
      "Specialist Assignment",
      "Scheduling",
      "Rescheduling",
      "Cancellation",
      "Customer Notifications",
      "Operations Coordination",
    ],
    flowLabel: "SYSTEM FLOW",
    flow: [
      "Customer",
      "WhatsApp",
      "Automation Engine",
      "Booking Logic",
      "Availability",
      "Specialist Assignment",
      "Calendar & Data",
      "Confirmation",
    ],
    // What happens at each stage (sanitized; consistent with the case-study architecture).
    flowNotes: [
      "Starts the booking in a familiar channel.",
      "The customer's message becomes a structured workflow event.",
      "Determines the conversation's current state and the valid next step.",
      "Business rules decide what can happen next.",
      "The requested slot is verified before anything is assigned.",
      "An eligible, available specialist is selected.",
      "The schedule and operational records are synchronized.",
      "The customer receives the resulting booking state.",
    ],
    flowControls: { run: "Run flow", replay: "Replay", pause: "Pause" },
    technology: "TECHNOLOGY",
    tech: ["n8n", "WhatsApp Cloud API", "Scheduling", "Database", "APIs"],
    interactive: "INTERACTIVE CASE STUDY",
    invite:
      "Experience the customer journey and see how the automation processes each booking step behind the interface.",
    cta: "Experience the System",
    briefLabel: "PROJECT BRIEF",
    brief: [
      ["Type", "Conversational booking & operations automation"],
      ["Problem", "Each booking conversation has to become a scheduled, assigned and recorded appointment across two branches."],
      ["What was engineered", "A WhatsApp booking workflow with booking rules, specialist assignment, scheduling and an operations interface."],
      ["What it automates", "Capturing service, time and location, checking availability, assigning eligible specialists and confirming. Late cancellations stay with people."],
      ["Integrations", "Meta WhatsApp Cloud API · n8n · Supabase · Google Calendar"],
      ["Engineering", "Workflow orchestration, intent routing, booking-state rules and sanitized architecture."],
      ["Explore", "The booking assistant, the stage-by-stage workflow, the decision logic and the operations console."],
    ],
  },
  ar: {
    eyebrow: "أعمال مختارة",
    title: "أنظمة نشرحها من خلال العمل الذي تطوّره.",
    lead: "أنظمة رقمية واقعية تُعرض عبر رحلة العمل وتجربة العميل والبنية التقنية المبسطة والآمنة للنشر.",
    category: "عمليات الخدمات",
    titleProject: "ريلاكس مون سبا",
    subtitle: "أتمتة الحجوزات والعمليات عبر واتساب",
    description:
      "منصة محادثة للحجز والعمليات صُممت لخدمة سبا متنقلة تعمل في الرياض والمنطقة الشرقية بالمملكة العربية السعودية.",
    detail:
      "يرشد النظام العميل من أول رسالة واتساب إلى اختيار الخدمة والتاريخ والوقت والموقع، ثم التحقق من التوفر وتعيين الأخصائي وتأكيد الحجز وإعادة الجدولة والإلغاء والإشعارات التشغيلية.",
    coordinates: "ما الذي ينسّقه النظام",
    items: [
      "الحجز عبر واتساب",
      "التوفر",
      "تعيين الأخصائي",
      "الجدولة",
      "إعادة الجدولة",
      "الإلغاء",
      "إشعارات العملاء",
      "تنسيق العمليات",
    ],
    flowLabel: "مسار النظام",
    flow: [
      "العميل",
      "واتساب",
      "محرك الأتمتة",
      "منطق الحجز",
      "التوفر",
      "تعيين الأخصائي",
      "التقويم والبيانات",
      "التأكيد",
    ],
    flowNotes: [
      "يبدأ الحجز عبر قناة مألوفة.",
      "تتحول رسالة العميل إلى حدث منظم في مسار العمل.",
      "يحدد حالة المحادثة الحالية والخطوة التالية المسموح بها.",
      "تحدد قواعد العمل ما يمكن أن يحدث بعد ذلك.",
      "يُتحقق من الموعد المطلوب قبل أي تعيين.",
      "يُختار أخصائي مؤهل ومتاح.",
      "تُزامَن الجدولة والسجلات التشغيلية.",
      "يتلقى العميل حالة الحجز الناتجة.",
    ],
    flowControls: { run: "شغّل المسار", replay: "أعد التشغيل", pause: "إيقاف مؤقت" },
    technology: "التقنيات",
    tech: [
      "n8n",
      "WhatsApp Cloud API",
      "الجدولة",
      "قاعدة البيانات",
      "واجهات API",
    ],
    interactive: "دراسة حالة تفاعلية",
    invite:
      "اختبر رحلة العميل وشاهد كيف تعالج الأتمتة كل خطوة من خطوات الحجز خلف الواجهة.",
    cta: "اختبر النظام",
    briefLabel: "ملخص المشروع",
    brief: [
      ["النوع", "منظومة حجز وتشغيل مؤتمتة عبر المحادثة"],
      ["المشكلة", "يجب أن تتحول كل محادثة حجز إلى موعد مجدول ومعيَّن ومسجَّل عبر فرعين."],
      ["ما الذي بُني", "مسار حجز عبر واتساب يضم قواعد الحجز وتعيين الأخصائي والجدولة وواجهة للتشغيل."],
      ["ما الذي يؤتمته", "جمع الخدمة والوقت والموقع، وفحص التوفر، وتعيين الأخصائي المؤهل، والتأكيد. ويبقى الإلغاء المتأخر لدى الفريق."],
      ["التكاملات", "Meta WhatsApp Cloud API · n8n · Supabase · Google Calendar"],
      ["الهندسة", "تنسيق مسارات العمل، وتوجيه الطلبات حسب نية العميل، وقواعد حالة الحجز، وبنية منقّحة للنشر."],
      ["ما يمكنك استكشافه", "مساعد الحجز، ومسار العمل مرحلة بمرحلة، ومنطق القرار، ولوحة التشغيل."],
    ],
  },
} as const;

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale),
    c = content[locale],
    live = await getPublishedProjects(locale);
  const projects = live?.length
    ? live
    : [
        {
          slug: "relax-moon-spa-automation",
          title: d.work.name,
          summary: d.work.summary,
          industry: d.work.industry,
          year: d.work.year,
          isDemo: true,
        },
      ];
  const relax = projects.find((project) => project.slug.includes("relax-moon"));
  const others = projects.filter(
    (project) => !project.slug.includes("relax-moon"),
  );
  return (
    <>
      <PageHero preset="work" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <section className={`${shared.content} ${styles.work}`}>
        <div className="shell">
          {relax && (
            <article className={styles.caseCard}>
              <header className={styles.caseHeader}>
                <span>01 / {c.category}</span>
                <span>ALS / CASE SYSTEM</span>
              </header>
              <div className={styles.caseGrid}>
                <div className={styles.overview}>
                  <span className="eyebrow">{c.titleProject}</span>
                  <h2>{c.subtitle}</h2>
                  <p className={styles.primary}>{c.description}</p>
                  <p>{c.detail}</p>
                </div>
                <div className={styles.coordinates}>
                  <h3>{c.coordinates}</h3>
                  <ul>
                    {c.items.map((item, index) => (
                      <li key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <section className={styles.brief} aria-label={c.briefLabel}>
                <h3>{c.briefLabel}</h3>
                <dl>
                  {c.brief.map(([term, detail]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{term === "Integrations" || term === "التكاملات" ? <bdi>{detail}</bdi> : detail}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <SystemFlow label={c.flowLabel} steps={c.flow} notes={c.flowNotes} controls={c.flowControls} dir={locale === "ar" ? "rtl" : "ltr"} testId="work-system-flow" />
              <footer className={styles.caseFooter}>
                <div>
                  <h3>{c.technology}</h3>
                  <p>{c.tech.join(" · ")}</p>
                </div>
                <div className={styles.invitation}>
                  <span>{c.interactive}</span>
                  <p>{c.invite}</p>
                  <Link
                    className="button button-primary"
                    href={`/${locale}/work/${relax.slug}`}
                  >
                    {c.cta}
                    <ArrowUpRight />
                  </Link>
                </div>
              </footer>
            </article>
          )}
          {others.map((project, index) => (
            <article className={shared.workGrid} key={project.slug}>
              <div className={shared.workArt}>
                <span>{String(index + 2).padStart(2, "0")}</span>
              </div>
              <div className={shared.workCopy}>
                {project.isDemo && (
                  <span className={shared.sample}>{d.work.exampleLabel}</span>
                )}
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
                <small className="muted">
                  {project.industry} · {project.year}
                </small>
                <Link
                  className="button button-ghost"
                  href={`/${locale}/work/${project.slug}`}
                >
                  {d.common.viewCase}
                  <ArrowUpRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
