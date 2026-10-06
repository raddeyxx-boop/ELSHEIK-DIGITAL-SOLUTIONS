import { HeroPixelBackground } from "@/components/backgrounds/hero-pixel-background";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerJourney } from "@/components/case-study/customer-journey";
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { AutomationLab } from "@/components/motion/system-experiences";
import { InteractiveBookingDemo } from "@/components/case-study/interactive-booking-demo";
import { RelaxMoonSpaDemo } from "@/components/case-study/operations-demo/relax-moon-spa-demo";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/content/dictionaries";
import { CmsReadError, getPublishedCaseStudy } from "@/server/queries/public-content";
import { getRelaxMoonArchitecture } from "@/components/architecture/data";
import type { ArchitectureNodeData } from "@/components/architecture/types";
import Link from "next/link";
import styles from "./case-study.module.css";
import { relaxMoon } from "@/content/case-studies/relax-moon";
import { Boundaries, ChallengeGrid, DecisionLogic, Guardrails, OperationsFrame, Outcomes, Responsibilities, TechnologyMatrix } from "@/components/case-study/relax-moon/relax-moon-sections";

// Rendered per request: when the CMS cannot answer, a case study other than the
// showcase must reach the in-site error boundary, which a statically generated path
// cannot do (a failed first generation is a bare 500). The showcase itself is
// prerendered by its own static segment (../relax-moon-spa-automation).
export const dynamic = "force-dynamic";
const labels = {
  en: {
    overview: "Overview",
    challenge: "The business problem",
    objectives: "Objectives",
    solution: "Engineering decisions",
    security: "Security & reliability",
    journey: "Customer journey",
    architecture: "System architecture",
    results: "Verified results",
    technology: "Technology",
    testimonial: "Client perspective",
  },
  ar: {
    overview: "نظرة عامة",
    challenge: "مشكلة العمل",
    objectives: "الأهداف",
    solution: "القرارات الهندسية",
    security: "الأمان والموثوقية",
    journey: "رحلة العميل",
    architecture: "بنية النظام",
    results: "نتائج موثقة",
    technology: "التقنيات",
    testimonial: "رأي العميل",
  },
};
type CaseStudy = NonNullable<Awaited<ReturnType<typeof getPublishedCaseStudy>>>;
import { SHOWCASE_SLUG } from "./showcase";
// A missing record is a 404. When the CMS cannot answer, the built-in showcase
// uses the same dictionary entry the Work page already lists it with (every
// other section below has its own fallback); any other slug reports the error.
async function loadCaseStudy(slug: string, locale: Locale): Promise<CaseStudy | null> {
  try {
    return await getPublishedCaseStudy(slug, locale);
  } catch (error) {
    if (!(error instanceof CmsReadError) || slug !== SHOWCASE_SLUG) throw error;
    const work = getDictionary(locale).work;
    return {
      project: { title: work.name, summary: work.summary, industry: work.industry, year: work.year, isDemo: true, seoTitle: "", seoDescription: "", canonicalUrl: null },
      sections: [], journey: [], nodes: [], connections: [], results: [], technologies: [], testimonials: [],
    };
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const data = await loadCaseStudy(slug, locale);
  if (!data) return {};
  return {
    title: data.project.seoTitle || data.project.title,
    description: data.project.seoDescription || data.project.summary,
    alternates: data.project.canonicalUrl
      ? { canonical: data.project.canonicalUrl }
      : undefined,
  };
}
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = await loadCaseStudy(slug, locale);
  if (!data) notFound();
  const fallbackArchitecture = getRelaxMoonArchitecture(locale),
    isRelax = slug.includes("relax-moon"),
    nodes = data.nodes.length ? data.nodes : fallbackArchitecture.nodes,
    connections = data.connections.length
      ? data.connections
      : fallbackArchitecture.connections,
    journey = data.journey.length
      ? data.journey
      : isRelax
        ? (locale === "ar"
            ? [
                "طلب الموعد",
                "اختيار الخدمة",
                "اختيار التاريخ",
                "اختيار الوقت",
                "تحديد الموقع",
                "فحص التوفر",
                "تعيين المختص",
                "تأكيد الحجز",
              ]
            : [
                "Appointment request",
                "Service selection",
                "Date selection",
                "Time selection",
                "Location",
                "Availability check",
                "Specialist assignment",
                "Booking confirmation",
              ]
          ).map((title) => ({ title, description: "", type: "action" }))
        : [],
    sections = data.sections.length
      ? data.sections
      : isRelax
        ? [
            {
              key: "challenge",
              value:
                locale === "ar"
                  ? "تحويل محادثة حجز متعددة الخطوات إلى سير عمل واضح ينسّق التوفر والتعيين والتأكيد."
                  : "Turn a multi-step booking conversation into a controlled workflow that coordinates availability, assignment, and confirmation.",
            },
            {
              key: "solution",
              value:
                locale === "ar"
                  ? "يربط النظام قناة واتساب بمنطق الحجز والتقويم والبيانات والإشعارات دون كشف تفاصيل التشغيل الداخلية."
                  : "The system connects the WhatsApp channel to booking logic, calendar, structured data, and notifications without exposing internal implementation details.",
            },
            {
              key: "security",
              value:
                locale === "ar"
                  ? "تعتمد التجربة العامة على حالات عمل محددة، والتحقق من المدخلات، ومعالجة خادمية محمية، مع إبقاء بيانات العملاء وبيانات الاعتماد وتفاصيل الربط خارج الواجهة العامة."
                  : "The public experience demonstrates deterministic workflow states, input validation, protected server-side processing, and sanitized data boundaries without exposing credentials or private integration details.",
            },
          ]
        : [],
    l = labels[locale],
    tech = data.technologies.flatMap((item) =>
      Array.isArray(item) ? item.map((v) => v.name) : [],
    ),
    approvedTech = tech.length ? tech : isRelax ? ["n8n", "Meta WhatsApp Cloud API", "Supabase", "Google Calendar"] : [],
    techRoles: Record<string, { en: string; ar: string }> = {
      "n8n": { en: "Workflow orchestration", ar: "تنسيق مسارات العمل" },
      "Meta WhatsApp Cloud API": { en: "Messaging channel", ar: "قناة المحادثة" },
      "Supabase": { en: "Structured application data", ar: "بيانات التطبيق المنظمة" },
      "Google Calendar": { en: "Scheduling concept", ar: "تنسيق المواعيد" },
    },
    // Structured Relax Moon sections render only for the showcase; CMS-driven case
    // studies keep the generic layout.
    rm = isRelax ? relaxMoon[locale] : null,
    matrix = rm ? rm.technologies.items.filter((item) => approvedTech.includes(item.name)) : [],
    usesFallbackJourney = isRelax && !data.journey.length;
  return (
    <>
      <section className={`${styles.opening} ${isRelax ? styles.relaxOpening : ""}`} data-pixel-hero="caseStudy"><HeroPixelBackground preset="caseStudy" />
        <div className="shell">
          <span className="eyebrow">CASE STUDY / CONNECTED OPERATIONS</span>
          <p>
            {data.project.industry} · {data.project.year}
          </p>
          <h1>{data.project.title}</h1>
          {rm && <p className={styles.positioning}>{rm.positioning}</p>}
          <p className="lead">{data.project.summary}</p>
          {isRelax && <p className={styles.location}>Saudi Arabia <span>Riyadh + Al Sharqiyah</span></p>}
          <div className={styles.openingSystem}>
            {["CUSTOMER", "CHANNEL", "AUTOMATION", "OPERATIONS", "OUTCOME"].map(
              (x, i) => (
                <span key={x}>
                  <i />0{i + 1}
                  <b>{x}</b>
                </span>
              ),
            )}
          </div>
        </div>
      </section>
      {isRelax && <InteractiveBookingDemo locale={locale} />}
      <div className={styles.story}>
        {sections.slice(0, 3).map((section, i) => (
          <section key={section.key}>
            <div className="shell">
              <span className="eyebrow">
                0{i + 1} / {l[section.key as keyof typeof l]}
              </span>
              <h2>{l[section.key as keyof typeof l]}</h2>
              <p>{section.value}</p>
              {rm && section.key === "challenge" && <ChallengeGrid copy={rm.challenge} />}
              {rm && section.key === "solution" && <Responsibilities copy={rm.responsibilities} />}
              {rm && section.key === "security" && <Guardrails copy={rm.guardrails} />}
            </div>
          </section>
        ))}
        {journey.length > 0 && (
          <section>
            <div className="shell">
              <span className="eyebrow">04 / WORKFLOW</span>
              <h2>{l.journey}</h2>
              <CustomerJourney steps={journey.map((x) => x.title)} locale={locale} {...(rm && usesFallbackJourney ? { details: rm.journey.details, detailLabels: rm.journey.detailLabels } : {})} />
              {rm && usesFallbackJourney && <p className={styles.modelNote}>{rm.modelNote}</p>}
              {/* Only CMS journeys carry per-stage descriptions; without them this would repeat the stage titles. */}
              {journey.some((x) => x.description) && <div className={styles.journeyNotes}>
                {journey.map((x, i) => (
                  <p key={x.title}>
                    <span>0{i + 1}</span>
                    <strong>{x.title}</strong>
                    {x.description}
                  </p>
                ))}
              </div>}
            </div>
          </section>
        )}
        {rm && (
          <section>
            <div className="shell">
              <span className="eyebrow">05 / {rm.decisions.label}</span>
              <h2>{rm.decisions.title}</h2>
              <DecisionLogic copy={rm.decisions} />
            </div>
          </section>
        )}
        <section>
          <div className="shell">
            <span className="eyebrow">{rm ? "06" : "05"} / SYSTEM IN ACTION</span>
            <h2>
              {locale === "ar" ? "النظام أثناء العمل" : "THE SYSTEM IN ACTION"}
            </h2>
            <AutomationLab locale={locale} />
          </div>
        </section>
        {rm && (
          <section>
            <div className="shell">
              <span className="eyebrow">07 / {rm.operations.label}</span>
              <h2>{rm.operations.title}</h2>
              <OperationsFrame copy={rm.operations} />
            </div>
          </section>
        )}
        {isRelax && <RelaxMoonSpaDemo locale={locale} />}
        {nodes.length > 1 && connections.length > 0 && (
          <section id="architecture">
            <div className="shell">
              <span className="eyebrow">{rm ? "08" : "06"} / TECHNICAL MAP</span>
              <h2>{l.architecture}</h2>
              <ArchitectureDiagram
                nodes={nodes as ArchitectureNodeData[]}
                connections={connections}
                locale={locale}
              />
              {rm && <Boundaries copy={rm.boundaries} />}
            </div>
          </section>
        )}
        {sections.slice(3).map((section) => (
          <section key={section.key}>
            <div className="shell">
              <h2>{l[section.key as keyof typeof l]}</h2>
              <p>{section.value}</p>
            </div>
          </section>
        ))}
        {approvedTech.length > 0 && (
          <section>
            <div className="shell">
              {rm && <span className="eyebrow">09 / {rm.technologies.label}</span>}
              <h2>{rm && matrix.length === approvedTech.length ? rm.technologies.title : l.technology}</h2>
              {rm && matrix.length === approvedTech.length ? <TechnologyMatrix copy={{ ...rm.technologies, items: matrix }} /> : <div className={styles.tech}>
                {approvedTech.map((x, i) => (
                  <span key={x}>
                    <b>0{i + 1} / {x}</b>
                    <small>{techRoles[x]?.[locale] || (locale === "ar" ? "تقنية معتمدة للمشروع" : "Approved project technology")}</small>
                  </span>
                ))}
              </div>}
            </div>
          </section>
        )}
        {rm && (
          <section>
            <div className="shell">
              <span className="eyebrow">10 / {rm.outcomes.label}</span>
              <h2>{rm.outcomes.title}</h2>
              <Outcomes copy={rm.outcomes} />
            </div>
          </section>
        )}
        {data.results.length > 0 && (
          <section>
            <div className="shell">
              <h2>{l.results}</h2>
              <div className={styles.results}>
                {data.results.map((x) => (
                  <article key={x.label}>
                    <strong>{x.value}</strong>
                    <h3>{x.label}</h3>
                    <p>{x.context}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        {data.testimonials.map((x) => (
          <section key={x.name}>
            <blockquote className="shell">
              <span className="eyebrow">{l.testimonial}</span>
              <p>“{x.quote}”</p>
              <footer>
                {x.name}
                {x.role && `, ${x.role}`}
                {x.organization && ` — ${x.organization}`}
              </footer>
            </blockquote>
          </section>
        ))}
      </div>
      <section className={styles.cta}>
        <div className="shell">
          {rm && <p className={styles.ctaLead}>{rm.cta}</p>}
          <h2>
            {locale === "ar"
              ? "نظامك القادم يبدأ هنا."
              : "YOUR NEXT SYSTEM STARTS HERE."}
          </h2>
          <Link className="button button-primary" href={`/${locale}/contact`}>
            {locale === "ar" ? "ابدأ مشروعاً" : "START A PROJECT"}
          </Link>
        </div>
      </section>
    </>
  );
}
