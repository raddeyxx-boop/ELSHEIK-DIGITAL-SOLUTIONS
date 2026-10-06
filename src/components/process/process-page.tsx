import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProcessContent, ProcessStage } from "@/content/process";
import type { Locale } from "@/lib/i18n/config";
import { StageNavigator } from "./stage-navigator";
import { AutomationMatrix } from "./automation-matrix";
import { ExecutionModel } from "./execution-model";
import { FeedbackLoop } from "./feedback-loop";
import styles from "./process.module.css";

// Server-rendered Process page body. Four small client islands hydrate: the stage
// navigator, the automation matrix, the execution model and the feedback loop.

const Code = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <bdi dir="ltr" className={`${styles.mono} ${className}`}>{children}</bdi>;

function Head({ eyebrow, title, body, id }: { eyebrow: string; title: string; body?: string; id: string }) {
  return (
    <header className={styles.head}>
      <div>
        <Code className={styles.eyebrow}>{eyebrow}</Code>
        <h2 id={id} className="heading">{title}</h2>
      </div>
      {body && <p className={styles.headBody}>{body}</p>}
    </header>
  );
}

function List({ items, className }: { items: string[]; className?: string }) {
  return <ul className={`${styles.list} ${className ?? ""}`}>{items.map(item => <li key={item}>{item}</li>)}</ul>;
}

function StagePanel({ stage, fields }: { stage: ProcessStage; fields: ProcessContent["framework"]["fields"] }) {
  const rows: [string, string, React.ReactNode][] = [
    ["IN", fields.inputs, <List key="in" items={stage.inputs} />],
    ["ACT", fields.activities, <div key="act">
      <List items={stage.activities} className={stage.activities.length > 5 ? styles.listSplit : undefined} />
      {stage.tracks && <div className={styles.tracks}>{stage.tracks.map(track => <div key={track.label}><h4>{track.label}</h4><List items={track.items} /></div>)}</div>}
    </div>],
    ["AUTO", fields.automation, <List key="auto" items={stage.automation} className={styles.listAccent} />],
    ["OUT", fields.outputs, <List key="out" items={stage.outputs} className={styles.listSplit} />],
    ["QA", fields.quality, <List key="qa" items={stage.quality} />],
  ];
  return (
    <article className={styles.stage}>
      <div className={styles.stageLead}>
        <Code className={styles.stageCode}>{`STAGE ${stage.number} / ${stage.code}`}</Code>
        <h3><Code className={styles.stageNumber}>{stage.number}</Code>{stage.title}</h3>
        <p className={styles.panelShort}>{stage.short}</p>
        <p className={styles.fieldLabel}><Code>OBJ</Code>{fields.objective}</p>
        <p className={styles.objective}>{stage.objective}</p>
        {stage.principle && <p className={styles.principle}>{stage.principle}</p>}
        <div className={styles.gate}>
          <p className={styles.fieldLabel}><Code>{`GATE ${stage.number}`}</Code>{fields.gate} — {stage.gate.name}</p>
          <p className={styles.gateQuestion}>{stage.gate.question}</p>
        </div>
      </div>
      <dl className={styles.fields}>
        {rows.map(([code, label, body]) => (
          <div key={code}>
            <dt><Code>{code}</Code>{label}</dt>
            <dd>{body}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Framework({ c, dir }: { c: ProcessContent; dir: "ltr" | "rtl" }) {
  const f = c.framework;
  return (
    <section className={`${styles.section} ${styles.framework}`} aria-labelledby="process-framework">
      <div className="shell">
        <Head id="process-framework" eyebrow={f.eyebrow} title={f.title} body={f.body} />
        <StageNavigator dir={dir} labels={f} stages={c.stages.map(({ id, number, title, short, next }) => ({ id, number, title, short, next }))}>
          {c.stages.map(stage => <StagePanel key={stage.id} stage={stage} fields={f.fields} />)}
        </StageNavigator>
      </div>
    </section>
  );
}

function Automation({ c, dir }: { c: ProcessContent; dir: "ltr" | "rtl" }) {
  const a = c.automationByDesign, m = c.executionModel;
  return (
    <>
      <section className={`${styles.section} ${styles.byDesign}`} aria-labelledby="process-automation">
        <div className={`shell ${styles.split}`}>
          <Head id="process-automation" eyebrow={a.eyebrow} title={a.title} body={a.body} />
          <AutomationMatrix label={a.title} rows={a.rows} phases={a.phases} stages={c.stages.map(({ id, number, title }) => ({ id, number, title }))} />
        </div>
      </section>
      <section className={`${styles.section} ${styles.model}`} id="execution-model" aria-labelledby="process-model">
        <div className="shell">
          <Head id="process-model" eyebrow={m.eyebrow} title={m.title} body={m.body} />
          <ExecutionModel m={m} dir={dir} />
          <p className={styles.note}>{m.note}</p>
        </div>
      </section>
    </>
  );
}

function Delivery({ c }: { c: ProcessContent }) {
  const a = c.artifacts, r = c.responsibility;
  return (
    <>
      <section className={`${styles.section} ${styles.artifacts}`} aria-labelledby="process-artifacts">
        <div className={`shell ${styles.split}`}>
          <Head id="process-artifacts" eyebrow={a.eyebrow} title={a.title} body={a.body} />
          <ol className={styles.artifactList}>
            {a.items.map((item, i) => (
              <li key={item.title}>
                <Code className={styles.muted}>{String(i + 1).padStart(2, "0")}</Code>
                <span>{item.title}</span>
                <Code className={styles.artifactStage}>{`S ${item.stages}`}</Code>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${styles.section} ${styles.responsibility}`} aria-labelledby="process-responsibility">
        <div className="shell">
          <Head id="process-responsibility" eyebrow={r.eyebrow} title={r.title} />
          <div className={styles.columns}>
            {r.columns.map(col => (
              <div key={col.code}>
                <Code className={styles.eyebrow}>{col.code}</Code>
                <h3>{col.title}</h3>
                <List items={col.items} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Gates({ c }: { c: ProcessContent }) {
  const g = c.gates;
  return (
    <section className={`${styles.section} ${styles.gates}`} aria-labelledby="process-gates">
      <div className="shell">
        <Head id="process-gates" eyebrow={g.eyebrow} title={g.title} body={g.body} />
        <ol className={styles.gateRail}>
          {c.stages.map(stage => (
            <li key={stage.id}>
              <Code className={styles.gateCode}>{`GATE ${stage.number}`}</Code>
              <strong>{stage.gate.name}</strong>
              <span>{stage.title}</span>
            </li>
          ))}
        </ol>
        <div className={styles.signals}>
          <div>
            <Code className={styles.eyebrow}>{g.signalsLabel}</Code>
            <p>{g.signalsBody}</p>
          </div>
          <ul>{g.signals.map(s => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function Boundary({ c }: { c: ProcessContent }) {
  const b = c.boundary;
  return (
    <section className={`${styles.section} ${styles.boundary}`} aria-labelledby="process-boundary">
      <div className="shell">
        <Head id="process-boundary" eyebrow={b.eyebrow} title={b.title} body={b.body} />
        <ol className={styles.boundaryRows}>
          {b.rows.map(row => (
            <li key={row.code}>
              <Code className={styles.boundaryCode}>{row.code}</Code>
              <h3>{row.title}</h3>
              <p>{row.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Principles({ c }: { c: ProcessContent }) {
  const f = c.failureFirst, s = c.security;
  return (
    <section className={`${styles.section} ${styles.principles}`} aria-labelledby="process-failure">
      <div className="shell">
        <Head id="process-failure" eyebrow={f.eyebrow} title={f.title} body={f.body} />
        <div className={styles.principleGrid}>
          <ul className={styles.conditions}>
            {f.conditions.map(x => <li key={x.code}><Code>{x.code}</Code><span>{x.label}</span></li>)}
          </ul>
          <div className={styles.security}>
            <Code className={styles.eyebrow}>{s.eyebrow}</Code>
            <h3 id="process-security">{s.title}</h3>
            <p>{s.body}</p>
            <List items={s.principles} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Loop({ c, dir }: { c: ProcessContent; dir: "ltr" | "rtl" }) {
  const l = c.loop;
  return (
    <section className={`${styles.section} ${styles.loop}`} aria-labelledby="process-loop">
      <div className={`shell ${styles.loopGrid}`}>
        <div>
          <Head id="process-loop" eyebrow={l.eyebrow} title={l.title} body={l.body} />
          <Code className={styles.eyebrow}>{l.evidenceLabel}</Code>
          <List items={l.evidence} className={styles.listSplit} />
        </div>
        <FeedbackLoop dir={dir} loop={l} evidenceNote={c.stages[7].next} stages={c.stages.map(({ id, number, title, short }) => ({ id, number, title, short }))} />
      </div>
    </section>
  );
}

function Cta({ c, locale }: { c: ProcessContent; locale: Locale }) {
  return (
    <section className={styles.cta} aria-labelledby="process-cta">
      <div className="shell">
        <div>
          <Code className={styles.eyebrow}>{c.cta.eyebrow}</Code>
          <h2 id="process-cta">{c.cta.title}</h2>
        </div>
        <div>
          <p>{c.cta.body}</p>
          <Link className="button button-primary" href={`/${locale}/contact`}>{c.cta.button}<ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

export function ProcessPageBody({ content, locale }: { content: ProcessContent; locale: Locale }) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <div className={styles.page}>
      <Framework c={content} dir={dir} />
      <Automation c={content} dir={dir} />
      <Delivery c={content} />
      <Gates c={content} />
      <Boundary c={content} />
      <Principles c={content} />
      <Loop c={content} dir={dir} />
      <Cta c={content} locale={locale} />
    </div>
  );
}
