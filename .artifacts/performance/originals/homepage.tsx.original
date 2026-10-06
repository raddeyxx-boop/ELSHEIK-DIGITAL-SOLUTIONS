import { HeroPixelBackground } from "@/components/backgrounds/hero-pixel-background";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MoveRight, Asterisk } from "lucide-react";
import { Arrow } from "@/components/ui/arrow";
import type { Dictionary } from "@/content/dictionaries/types";
import type { Locale } from "@/lib/i18n/config";
import { SystemField } from "@/components/motion/system-field";
import { ConnectedWorkflow } from "@/components/motion/connected-workflow";
import { FeaturedCaseStudy } from "@/components/case-study/featured-case-study";
import { ServiceList } from "@/components/services/service-list";
import styles from "./homepage.module.css";
type Project = {
  slug: string;
  title: string;
  summary: string;
  industry: string;
  year: string;
  isDemo: boolean;
};
type Service = {
  id: string;
  title: string;
  body: string;
  outcome: string;
  tech: string;
};
export function Homepage({
  locale,
  dictionary: d,
  projects = [],
  services = [],
  showHero = true,
}: {
  locale: Locale;
  dictionary: Dictionary;
  projects?: Project[];
  services?: Service[];
  showHero?: boolean;
}) {
  const ar = locale === "ar";
  const serviceItems = services.length ? services : d.services.items;
  const relax =
    projects.find((p) => p.slug.includes("relax-moon")) || projects[0];
  const process = ar
    ? ["اكتشاف", "تعريف", "تصميم", "هندسة", "أتمتة", "تحسين"]
    : ["Discover", "Define", "Design", "Engineer", "Automate", "Optimize"];
  const fieldThemes = ar
    ? [
        {
          title: "تصميم الأنظمة",
          body: "يجب أن تدعم الواجهات العمليات التي تقف خلفها.",
        },
        {
          title: "الأتمتة",
          body: "تزيل الأتمتة الجيدة الاحتكاك مع إبقاء التحكم واضحًا.",
        },
        {
          title: "البيانات",
          body: "تعتمد الأنظمة المفيدة على تدفق معلومات نظيف ومقصود.",
        },
        {
          title: "العمليات",
          body: "يجب أن تتوافق البرمجيات مع طريقة عمل الشركة فعليًا.",
        },
      ]
    : [
        {
          title: "SYSTEM DESIGN",
          body: "Interfaces should support the operation behind them.",
        },
        {
          title: "AUTOMATION",
          body: "Good automation removes friction without hiding control.",
        },
        {
          title: "DATA",
          body: "Useful systems depend on clean, intentional information flow.",
        },
        {
          title: "OPERATIONS",
          body: "Software should match the way a business actually works.",
        },
      ];
  const startSignals = ar
    ? [
        "موقع جديد أو تجربة رقمية",
        "تطبيق أعمال داخلي",
        "تطبيق جوال",
        "مسار عمل مؤتمت",
        "عملية مدعومة بالذكاء الاصطناعي",
        "نظام برمجي مخصص",
      ]
    : [
        "New website or digital experience",
        "Internal business application",
        "Mobile application",
        "Automation workflow",
        "AI-enabled process",
        "Custom software system",
      ];
  return (
    <>
      {showHero && <HomepageHero locale={locale} dictionary={d} />}
      <section className={styles.positioning}>
        <div className="shell">
          <Asterisk />
          <p>
            {ar
              ? "نحن لا نسلّم صفحات. نصمم ونبني أنظمة رقمية تربط تجربة العميل بمنطق التشغيل والبيانات."
              : "We do not deliver pages. We design and engineer digital systems that connect customer experience to operations and data."}
          </p>
          <span
            className={styles.editorialTicker}
            lang="en"
            data-testid="editorial-ticker"
          >
            <i className={styles.tickerSource}>
              DESIGN × ENGINEERING × OPERATIONS
            </i>
            <i className={styles.tickerWindow} aria-hidden="true">
              <i className={styles.tickerTrack}>
                <b className={styles.tickerRepeat}>
                  DESIGN × ENGINEERING × OPERATIONS
                </b>
                <b className={styles.tickerRepeat}>
                  DESIGN × ENGINEERING × OPERATIONS
                </b>
                <b className={styles.tickerRepeat}>
                  DESIGN × ENGINEERING × OPERATIONS
                </b>
                <b className={styles.tickerRepeat}>
                  DESIGN × ENGINEERING × OPERATIONS
                </b>
              </i>
            </i>
          </span>
        </div>
      </section>
      <section className={styles.services} data-testid="services-showcase">
        <div className="shell">
          <header className={styles.sectionHead}>
            <span>01</span>
            <div>
              <small>{d.services.eyebrow}</small>
              <h2>
                {ar
                  ? "قدرات تتحول إلى نتائج."
                  : "Capabilities that become outcomes."}
              </h2>
            </div>
            <Link href={`/${locale}/services`}>
              {ar ? "كل الخدمات" : "All services"}
              <ArrowUpRight />
            </Link>
          </header>
          <ServiceList services={serviceItems.slice(0, 6)} locale={locale} />
        </div>
      </section>
      <section className={styles.work}>
        <div className="shell">
          <header className={styles.sectionHead}>
            <span>02</span>
            <div>
              <small>{ar ? "عمل مختار" : "SELECTED WORK"}</small>
              <h2>
                {ar
                  ? "أنظمة صُممت حول العمل الحقيقي."
                  : "Systems shaped around real work."}
              </h2>
            </div>
          </header>
          <div className={styles.workGrid}>
            {projects.slice(0, 2).map((project, index) => (
              <Link
                href={`/${locale}/work/${project.slug}`}
                key={project.slug}
                className={styles.project}
              >
                <div>
                  <span>CASE / 0{index + 1}</span>
                  <strong>{project.industry}</strong>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <footer>
                  <span>{project.year}</span>
                  <ArrowDownRight />
                </footer>
              </Link>
            ))}
            {/* Project gateway: a bordered editorial panel; lime is reserved for the
                index marker, the rule and the call to action. */}
            <Link href={`/${locale}/work`} className={styles.workAll}>
              <span className={styles.archiveIndex}>
                <i aria-hidden="true" />
                <bdi dir="ltr">INDEX / WORK</bdi>
              </span>
              <span className={styles.archiveBody}>
                <strong>{ar ? "أرشيف المشاريع" : "Work archive"}</strong>
                <span>
                  {ar
                    ? "أنظمة مختارة، وأعمال أتمتة، وهندسة منتجات."
                    : "Explore selected systems, automation work and product engineering."}
                </span>
              </span>
              <span className={styles.archiveMeta} aria-hidden="true">
                <bdi dir="ltr">SYSTEMS · WORKFLOWS · ARCHITECTURE</bdi>
              </span>
              <span className={styles.archiveCta}>
                {ar ? "استكشف الأعمال" : "Explore work"}
                <Arrow locale={locale} />
              </span>
            </Link>
          </div>
        </div>
      </section>
      {relax && (
        <FeaturedCaseStudy
          locale={locale}
          project={relax}
          viewLabel={d.common.viewCase}
          copy={d.featuredCase}
        />
      )}
      <section className={styles.technology} data-testid="technology-in-action">
        <div className="shell">
          <header className={styles.sectionHead}>
            <span>03</span>
            <div>
              <small>{ar ? "النظام أثناء العمل" : "SYSTEM IN MOTION"}</small>
              <h2>
                {ar
                  ? "من طلب إلى نتيجة، خطوة بخطوة."
                  : "From request to outcome, state by state."}
              </h2>
            </div>
          </header>
          <ConnectedWorkflow locale={locale} />
        </div>
      </section>
      <section className={styles.process}>
        <div className="shell">
          <header className={styles.sectionHead}>
            <span>04</span>
            <div>
              <small>{ar ? "طريقة العمل" : "METHOD"}</small>
              <h2>
                {ar
                  ? "عملية واحدة. نظام يتطور."
                  : "One process. A system that evolves."}
              </h2>
            </div>
          </header>
          <ol>
            {process.map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
                <i />
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={styles.insightBand}>
        <div className="shell">
          <span>05 / FIELD NOTES</span>
          <h2>
            {ar
              ? "أفكار حول تصميم وتشغيل الأنظمة الرقمية."
              : "Thinking about how digital systems should be designed—and run."}
          </h2>
          <Link href={`/${locale}/insights`}>
            {ar ? "اقرأ الرؤى" : "Read insights"}
            <ArrowUpRight />
          </Link>
        </div>
      </section>
      <section className={styles.finalCta} data-testid="final-cta">
        <div className="shell">
          <div>
            <span>06 / NEXT MOVE</span>
            <h2>
              {ar
                ? "لنبنِ النظام الذي يحتاجه عملك الآن."
                : "Let’s build what your business needs next."}
            </h2>
          </div>
          <div>
            <p>{d.cta.body}</p>
            <Link className="button button-primary" href={`/${locale}/contact`}>
              {d.cta.button}
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function HomepageHero({ locale, dictionary: d }: { locale: Locale; dictionary: Dictionary }) {
  const ar = locale === "ar";
  return (
<section className={styles.hero} data-testid="homepage-hero" data-pixel-hero="home"><HeroPixelBackground preset="home" />
        <div className={`${styles.heroTop} shell`}>
          <span>ALS / 2026</span>
          <span>
            {ar
              ? "هندسة رقمية للأعمال"
              : "DIGITAL ENGINEERING FOR REAL BUSINESS"}
          </span>
        </div>
        <div className={`${styles.heroGrid} shell`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">{d.hero.eyebrow}</span>
            <h1>
              {ar ? (
                <>
                  نحوّل <em>تعقيد الأعمال</em> إلى أنظمة تتحرك.
                </>
              ) : (
                <>
                  <span>We turn</span>{" "}<em><span>business</span>{" "}<span>complexity</span></em>{" "}<span>into</span>{" "}<span>systems</span>{" "}<span>that move.</span>
                </>
              )}
            </h1>
            <p>{d.hero.body}</p>
            <div className={styles.actions}>
              <Link
                className="button button-primary"
                href={`/${locale}/contact`}
              >
                {d.hero.primary}
                <ArrowUpRight />
              </Link>
              <Link className="button button-ghost" href={`/${locale}/work`}>
                {d.hero.secondary}
                <MoveRight />
              </Link>
            </div>
            <div className={styles.heroIndex}>
              <span>01 / EXPERIENCE</span>
              <span>02 / SOFTWARE</span>
              <span>03 / AUTOMATION</span>
              <span>04 / IMPACT</span>
            </div>
          </div>
          <SystemField locale={locale} />
        </div>
      </section>
  );
}
