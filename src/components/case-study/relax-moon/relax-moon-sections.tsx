import type { relaxMoon, AutomationMode } from "@/content/case-studies/relax-moon";
import styles from "./relax-moon.module.css";

type Copy = (typeof relaxMoon)["en"];
const num = (index: number) => String(index + 1).padStart(2, "0");

export function ChallengeGrid({ copy }: { copy: Copy["challenge"] }) {
  return <div className={styles.block}>
    <p className={styles.label}>{copy.label}</p>
    <h3 className={styles.title}>{copy.title}</h3>
    <p className={styles.intro}>{copy.intro}</p>
    <dl className={styles.grid4}>
      {copy.variables.map(([term, detail], index) => <div key={term}><dt><span aria-hidden="true">{num(index)}</span>{term}</dt><dd>{detail}</dd></div>)}
    </dl>
  </div>;
}

function Mode({ mode, legend }: { mode: AutomationMode; legend: Copy["responsibilities"]["legend"] }) {
  return <span className={styles.mode} data-mode={mode}>{legend[mode][0]}</span>;
}

export function Responsibilities({ copy }: { copy: Copy["responsibilities"] }) {
  return <div className={styles.block}>
    <p className={styles.label}>{copy.label}</p>
    <h3 className={styles.title}>{copy.title}</h3>
    <p className={styles.intro}>{copy.intro}</p>
    <dl className={styles.legend}>
      {(Object.keys(copy.legend) as AutomationMode[]).map(mode => <div key={mode}><dt><Mode mode={mode} legend={copy.legend} /></dt><dd>{copy.legend[mode][1]}</dd></div>)}
    </dl>
    <ol className={styles.grid2}>
      {copy.items.map((item, index) => <li key={item.title}>
        <span className={styles.index} aria-hidden="true">{num(index)}</span>
        <div><h4>{item.title}</h4><p>{item.body}</p></div>
        <Mode mode={item.mode} legend={copy.legend} />
      </li>)}
    </ol>
  </div>;
}

export function DecisionLogic({ copy }: { copy: Copy["decisions"] }) {
  return <div>
    <p className={styles.intro}>{copy.intro}</p>
    <dl className={styles.decisions}>
      {copy.items.map(([question, rule], index) => <div key={question}><dt><span aria-hidden="true">{num(index)}</span>{question}</dt><dd>{rule}</dd></div>)}
    </dl>
    <div className={styles.lifecycle}>
      <h3 className={styles.subTitle}>{copy.lifecycleTitle}</h3>
      <p className={styles.intro}>{copy.lifecycleIntro}</p>
      <ol className={styles.states}>
        {copy.states.map((state, index) => <li key={state.name} data-final={state.final ? "true" : undefined}>
          <span aria-hidden="true">{num(index)}</span><strong>{state.name}</strong><small>{state.note}</small>
        </li>)}
      </ol>
      <ul className={styles.transitions}>{copy.transitions.map(transition => <li key={transition}><bdi>{transition}</bdi></li>)}</ul>
      <p className={styles.note}>{copy.change}</p>
    </div>
  </div>;
}

export function Boundaries({ copy }: { copy: Copy["boundaries"] }) {
  return <div className={styles.block}>
    <h3 className={styles.subTitle}>{copy.title}</h3>
    <p className={styles.intro}>{copy.intro}</p>
    <ol className={styles.boundaries}>
      {copy.items.map(([from, to, data], index) => <li key={`${from}-${to}`}>
        <span className={styles.index} aria-hidden="true">{num(index)}</span>
        <p className={styles.route}><bdi>{from}</bdi><i aria-hidden="true" /><bdi>{to}</bdi></p>
        <p>{data}</p>
      </li>)}
    </ol>
  </div>;
}

export function TechnologyMatrix({ copy }: { copy: Copy["technologies"] }) {
  return <div>
    <p className={styles.intro}>{copy.intro}</p>
    <div className={styles.matrix}>
      {copy.items.map((item, index) => <article key={item.name}>
        <header><span aria-hidden="true">{num(index)}</span><h3><bdi>{item.name}</bdi></h3><p className={styles.layer}>{item.layer}</p></header>
        <p>{item.responsibility}</p>
        <dl>
          <div><dt>{copy.fields.handles}</dt><dd>{item.handles}</dd></div>
          <div><dt>{copy.fields.connects}</dt><dd><bdi>{item.connects}</bdi></dd></div>
        </dl>
      </article>)}
    </div>
  </div>;
}

export function Guardrails({ copy }: { copy: Copy["guardrails"] }) {
  return <div className={styles.block}>
    <h3 className={styles.subTitle}>{copy.title}</h3>
    <p className={styles.intro}>{copy.intro}</p>
    <dl className={styles.grid4}>
      {copy.items.map(([term, detail], index) => <div key={term}><dt><span aria-hidden="true">{num(index)}</span>{term}</dt><dd>{detail}</dd></div>)}
    </dl>
    <p className={styles.note}>{copy.scope}</p>
  </div>;
}

export function OperationsFrame({ copy }: { copy: Copy["operations"] }) {
  return <div className={styles.operations}>
    <p>{copy.represents}</p>
    <div>
      <h3 className={styles.label}>{copy.exploreTitle}</h3>
      <ul>{copy.explore.map((item, index) => <li key={item}><span aria-hidden="true">{num(index)}</span>{item}</li>)}</ul>
      <p className={styles.note}>{copy.note}</p>
    </div>
  </div>;
}

export function Outcomes({ copy }: { copy: Copy["outcomes"] }) {
  return <div>
    <ul className={styles.outcomes}>{copy.items.map((item, index) => <li key={item}><span aria-hidden="true">{num(index)}</span>{item}</li>)}</ul>
    <p className={styles.note}>{copy.note}</p>
  </div>;
}
