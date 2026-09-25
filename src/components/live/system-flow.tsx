"use client";

import { useId, useRef, type CSSProperties } from "react";
import { intentionalHover, stepKey, useLiveFlow } from "./use-live-flow";
import { PlaybackControl, Readout, type PlaybackLabels } from "./live-parts";
import styles from "./system-flow.module.css";

// A linear system flow: one signal travels the connection path and the stage it
// reaches becomes active. Hover, focus or tap a stage to read what happens there.
export function SystemFlow({ label, steps, notes, dir, controls, testId, flush = false }: { label: string; steps: readonly string[]; notes: readonly string[]; dir: "ltr" | "rtl"; controls: PlaybackLabels; testId?: string; flush?: boolean }) {
  const count = steps.length;
  const { ref, frame, playing, ran, play, pause, select } = useLiveFlow(count);
  const readout = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const number = (index: number) => String(index + 1).padStart(2, "0");
  return (
    <div ref={ref} className={styles.flow} data-flush={flush || undefined} style={{ "--i": frame, "--n": count } as CSSProperties} data-testid={testId}>
      <div className={styles.head}>
        <h3>{label}</h3>
        <PlaybackControl labels={controls} playing={playing} ran={ran} onPlay={play} onPause={pause} />
      </div>
      <div className={styles.track}>
        <span className={styles.progress} aria-hidden="true" />
        <span className={styles.signal} aria-hidden="true" />
        <ol className={styles.nodes} aria-label={label}>
          {steps.map((step, index) => (
            <li key={step} data-state={index === frame ? "active" : index < frame ? "done" : undefined}>
              <button ref={el => { buttons.current[index] = el; }} type="button" aria-pressed={index === frame} aria-describedby={index === frame ? readout : undefined}
                onClick={() => select(index)} onFocus={() => { if (index !== frame) select(index); }}
                onPointerMove={event => { if (!playing && index !== frame && intentionalHover(event)) select(index); }}
                onKeyDown={event => { const target = stepKey(event, index, count, dir); if (target >= 0) buttons.current[target]?.focus(); }}>
                <bdi dir="ltr" className={styles.num}>{number(index)}</bdi>
                <b>{step}</b>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Readout id={readout} active={frame} className={styles.readout}
        items={steps.map((step, index) => <p key={step}><bdi dir="ltr" className={styles.num}>{number(index)}</bdi><strong>{step}</strong><span>{notes[index]}</span></p>)} />
    </div>
  );
}
