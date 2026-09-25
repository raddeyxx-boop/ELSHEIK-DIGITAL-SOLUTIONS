"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { statesFor } from "@/content/system-states";

// Renders inside the locale layout (header, footer, direction and Arabic typeface).
export default function LocaleNotFound() {
  const { locale } = useParams<{ locale: string }>();
  const copy = statesFor(locale).notFound, prefix = locale === "ar" ? "/ar" : "/en";
  return <section style={{ minHeight: "70vh", display: "grid", placeContent: "center", textAlign: "center", padding: "2rem" }}>
    <span className="eyebrow">{copy.eyebrow}</span>
    <h1 className="heading">{copy.title}</h1>
    <p className="lead" style={{ marginInline: "auto" }}>{copy.body}</p>
    <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
      <Link className="button button-primary" href={prefix}>{copy.home}</Link>
      <Link className="button button-ghost" href={`${prefix}/work`}>{copy.work}</Link>
    </div>
  </section>;
}
