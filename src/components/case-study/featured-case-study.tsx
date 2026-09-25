"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/content/dictionaries/types";
import { Arrow } from "@/components/ui/arrow";
import styles from "@/components/sections/homepage.module.css";

export function FeaturedCaseStudy({ locale, project, viewLabel, copy }: {
  locale: Locale;
  project: { slug: string; title: string; summary: string };
  viewLabel: string;
  copy: Dictionary["featuredCase"];
}) {
  const ar = locale === "ar";
  const { messages, steps } = copy;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, margin: "-20%" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!visible || reduce || active >= steps.length - 1) return;
    const timer = setTimeout(() => setActive((value) => value + 1), 680);
    return () => clearTimeout(timer);
  }, [active, reduce, visible, steps.length]);

  return (
    <section ref={ref} className={styles.feature} data-testid="featured-case-study" data-stage={active}>
      <div className={`${styles.featureGrid} shell`}>
        <div className={styles.projectCopy}>
          <span className="eyebrow">{ar ? "دراسة حالة مميزة" : "Featured case study"}</span>
          <h2>{project.title}</h2>
          <h3>{ar ? "حجز واتساب وأتمتة العمليات" : "WhatsApp Booking & Operations Automation"}</h3>
          <small><MapPin aria-hidden="true" /> {ar ? "الرياض + الشرقية، المملكة العربية السعودية" : "Riyadh + Al Sharqiyah, Saudi Arabia"}</small>
          <p>{project.summary}</p>
          <Link className="button button-ghost" href={`/${locale}/work/${project.slug}`}>
            {viewLabel}<Arrow locale={locale} />
          </Link>
        </div>
        <div className={styles.phone} aria-label={ar ? "محادثة حجز توضيحية" : "Booking conversation demonstration"}>
          <div className={styles.notch} />
          <header dir={ar ? "rtl" : undefined}><span aria-hidden="true">‹</span><b>{copy.phoneName}</b><small>{copy.phoneAccount}</small></header>
          <div className={styles.chat} aria-live="polite">
            {messages.map((message, index) => (
              <p key={message} dir={ar ? "rtl" : undefined} className={index <= Math.min(active, messages.length - 1) ? styles.chatVisible : ""}>{message}</p>
            ))}
          </div>
        </div>
        <ol className={styles.bookingFlow} aria-label={ar ? "مراحل نظام الحجز" : "Booking system stages"}>
          {steps.map((step, index) => (
            <li key={step} className={index < active ? styles.flowDone : index === active ? styles.flowActive : ""}>
              <span dir={ar ? "rtl" : undefined}>{String(index + 1).padStart(2, "0")}</span>{ar ? <bdi dir="rtl">{step}</bdi> : step}{index < active && <Check aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <div className={styles.spaVisual} aria-label={ar ? "تصور مشروع ريلاكس مون سبا" : "Relax Moon Spa project visual"}>
          <div className={styles.spaLight} /><div className={styles.pool} /><div className={styles.lounge} />
          <strong dir={ar ? "rtl" : undefined} className={ar ? styles.spaSloganArabic : undefined}>{copy.slogan.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</strong><small>01 / 01</small>
        </div>
      </div>
    </section>
  );
}
