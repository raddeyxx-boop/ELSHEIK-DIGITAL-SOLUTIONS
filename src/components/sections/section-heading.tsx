export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return <div className="section-head"><span className="eyebrow">{eyebrow}</span><div><h2 className="heading">{title}</h2>{intro && <p className="lead" style={{ marginBlockStart: "1.5rem" }}>{intro}</p>}</div></div>;
}

