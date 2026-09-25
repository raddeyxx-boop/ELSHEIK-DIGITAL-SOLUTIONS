"use client";

import { Children, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import styles from "./process.module.css";

export type StageSummary = { id: string; number: string; title: string; short: string; next: string };
type Labels = { tablist: string; selected: string; nextLabel: string; loopLabel: string; loopHint: string };

// Tabs pattern: the stage panels are rendered on the server and passed in as
// children, so this boundary only owns the selected index and keyboard focus.
export function StageNavigator({ stages, labels, dir, children }: { stages: StageSummary[]; labels: Labels; dir: "ltr" | "rtl"; children: ReactNode }) {
  const panels = Children.toArray(children);
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const region = useRef<HTMLDivElement>(null);
  const base = useId();
  const count = stages.length;
  const last = active === count - 1;
  const following = stages[(active + 1) % count];

  const focusTab = (index: number) => { setActive(index); tabs.current[index]?.focus(); };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const target = event.key === forward ? (active + 1) % count
      : event.key === back ? (active - 1 + count) % count
      : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : -1;
    if (target < 0) return;
    event.preventDefault();
    focusTab(target);
  };
  const advance = () => {
    setActive((active + 1) % count);
    // Keep the new panel's start in view when the reader has scrolled into a long panel.
    const top = region.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) region.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className={styles.navigator} ref={region}>
      <div className={styles.tabs} role="tablist" aria-label={labels.tablist}>
        {stages.map((stage, index) => (
          <button key={stage.id} ref={el => { tabs.current[index] = el; }} type="button" role="tab"
            id={`${base}-tab-${stage.id}`} aria-controls={`${base}-panel-${stage.id}`}
            aria-selected={index === active} tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)} onKeyDown={onKeyDown}>
            <span className={styles.tabHead}>
              <span className={styles.tabNumber} dir="ltr">{stage.number}</span>
              <span className={styles.tabDot} aria-hidden="true" />
            </span>
            <strong>{stage.title}</strong>
            <span className={styles.tabShort}>{stage.short}</span>
            {index === count - 1 && <span className={styles.tabLoop} aria-hidden="true"><RotateCcw size={12} strokeWidth={1.6} /><bdi>01</bdi></span>}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{`${labels.selected}: ${stages[active].number} ${stages[active].title}`}</p>
      {panels.map((panel, index) => (
        <div key={stages[index].id} role="tabpanel" id={`${base}-panel-${stages[index].id}`} aria-labelledby={`${base}-tab-${stages[index].id}`}
          hidden={index !== active} tabIndex={0} className={styles.panel}>
          {panel}
        </div>
      ))}
      <div className={styles.advance}>
        <p><span className={styles.mono}>{last ? labels.loopHint : labels.nextLabel}</span>{stages[active].next}</p>
        <button type="button" onClick={advance} data-loop={last || undefined}>
          {last ? <RotateCcw size={17} strokeWidth={1.6} aria-hidden="true" /> : null}
          <span>{last ? labels.loopLabel : labels.nextLabel}</span>
          <span className={styles.advanceTarget}><bdi dir="ltr">{following.number}</bdi> {following.title}</span>
          {last ? null : <Arrow size={17} strokeWidth={1.6} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
