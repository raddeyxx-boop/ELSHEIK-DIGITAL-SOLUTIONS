import { HeroPixelBackground } from "@/components/backgrounds/hero-pixel-background";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemFlow } from "@/components/live/system-flow";
import { Arrow } from "@/components/ui/arrow";
import { getDictionary } from "@/content/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import styles from "./about.module.css";

export default async function AboutPage({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const d=getDictionary(locale).about;
  const num=(i:number)=>String(i+1).padStart(2,"0");
  return <div className={styles.about} data-testid="about-page">
    <header className={styles.hero} data-pixel-hero="about"><HeroPixelBackground preset="about" /><div className="shell">
      <span className="eyebrow">{d.eyebrow}</span><h1>{d.title.split(".").filter(Boolean).map(line=><span key={line}>{line.trim()}. </span>)}</h1>
      <div className={styles.introduction}><p>{d.lead.split("ELSHEIK DIGITAL SOLUTIONS")[0]}<bdi lang="en">ELSHEIK DIGITAL SOLUTIONS</bdi>{d.lead.split("ELSHEIK DIGITAL SOLUTIONS")[1]}</p><p>{d.introduction}</p></div>
      <span className={styles.systemLabel} aria-hidden="true">{d.systemLabel}</span>
    </div></header>
    <section className={styles.section} aria-label={d.principlesLabel} data-testid="about-principles"><div className={`${styles.principles} shell`}>
      {d.sections.map((item,i)=><article key={item.title}><span className={styles.number}><bdi>{num(i)}</bdi></span><h2>{item.title}</h2><p>{item.body}</p></article>)}
    </div></section>
    <section className={styles.section} aria-labelledby="about-build" data-testid="about-build"><div className={`${styles.split} shell`}>
      <div className={styles.sectionHeading}><span className={styles.number}>04</span><h2 id="about-build">{d.build.title}</h2><p>{d.build.body}</p></div>
      <div className={styles.rows}>{d.build.items.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
    </div></section>
    <section className={`${styles.section} ${styles.thinking}`} aria-labelledby="about-thinking"><div className="shell">
      <div className={styles.sectionHeading}><span className={styles.number}>05</span><h2 id="about-thinking">{d.thinking.title}</h2></div>
      <div className={styles.columns}>{d.thinking.items.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
    </div></section>
    <section className={`${styles.section} ${styles.automation}`} aria-labelledby="about-automation" data-testid="about-automation"><div className="shell">
      <div className={styles.sectionHeading}><span className="eyebrow"><bdi>06</bdi> / {d.automation.label}</span><h2 id="about-automation">{d.automation.title}</h2></div>
      <div className={styles.automationCopy}><p>{d.automation.body}</p><ul>{d.automation.connections.map(item=><li key={item}>{item}</li>)}</ul><p>{d.automation.outcome}</p></div>
      <SystemFlow flush label={d.automation.flowLabel} steps={d.automation.steps} notes={d.automation.stepNotes} controls={d.automation.flowControls} dir={locale==="ar"?"rtl":"ltr"} testId="about-flow"/>
    </div></section>
    <section className={styles.section} aria-labelledby="about-engineering"><div className={`${styles.split} shell`}>
      <div className={styles.sectionHeading}><span className="eyebrow"><bdi>07</bdi> / {d.engineering.label}</span><h2 id="about-engineering">{d.engineering.title}</h2><p>{d.engineering.body}</p></div>
      <div className={styles.layers}>{d.engineering.items.map((item,i)=><article key={item.title}><span className={styles.number}><bdi>{num(i)}</bdi></span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
    </div></section>
    <section className={styles.section} aria-labelledby="about-process" data-testid="about-process"><div className="shell">
      <div className={styles.sectionHeading}><span className="eyebrow"><bdi>08</bdi> / {d.process.label}</span><h2 id="about-process">{d.process.title}</h2></div>
      <ol className={styles.process}>{d.process.items.map((item,i)=><li key={item.title}><span className={styles.number}><bdi>{num(i)}</bdi></span><h3>{item.title}</h3><p>{item.body}</p></li>)}</ol>
    </div></section>
    <section className={`${styles.section} ${styles.cta}`} aria-labelledby="about-cta" data-testid="about-cta"><div className={`${styles.split} shell`}>
      <div className={styles.sectionHeading}><span className="eyebrow"><bdi>09</bdi> / {d.cta.label}</span><h2 id="about-cta">{d.cta.title}</h2></div>
      <div className={styles.ctaCopy}><p>{d.cta.body}</p><div className={styles.actions}><Link className="button button-primary" href={`/${locale}/contact`}>{d.cta.primary}<Arrow locale={locale}/></Link><Link className="button button-ghost" href={`/${locale}/work`}>{d.cta.secondary}<Arrow locale={locale}/></Link></div></div>
    </div></section>
  </div>;
}
