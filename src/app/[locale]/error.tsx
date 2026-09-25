"use client";
import { useParams } from "next/navigation";
import { statesFor } from "@/content/system-states";

// Error UI inside the locale layout (header and footer stay), e.g. when the CMS
// cannot answer a detail-page read.
export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const copy = statesFor(useParams<{ locale: string }>().locale).error;
  return <section style={{ minHeight: "70vh", display: "grid", placeContent: "center", padding: "2rem" }}>
    <div><span className="eyebrow">{copy.eyebrow}</span><h1 className="heading">{copy.title}</h1><p className="lead">{copy.body}</p><button className="button button-primary" onClick={reset}>{copy.retry}</button></div>
  </section>;
}
