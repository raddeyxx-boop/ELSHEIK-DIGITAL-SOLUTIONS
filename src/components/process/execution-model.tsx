"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { ProcessContent } from "@/content/process";
import { intentionalHover, stepKey, useLiveFlow } from "@/components/live/use-live-flow";
import { Readout } from "@/components/live/live-parts";
import live from "@/components/live/live.module.css";
import styles from "./process.module.css";

type Model = ProcessContent["executionModel"];
type Mode = "manual" | "success" | "failure";
// One frame of a deterministic run: the node reached (or the failure branch), the
// readout line, and which failure-handling options are engaged.
type Frame = { node?: number; readout: number; options?: string[] };
const VERIFY = 4;
const success: Frame[] = [0, 1, 2, 3, 4, 5, 6].map(node => ({ node, readout: node }));
const failure: Frame[] = [
  ...success.slice(0, VERIFY),
  { node: VERIFY, readout: 7 },
  { readout: 8, options: ["RETRY"] },
  { readout: 9, options: ["FALLBACK", "ALERT", "HUMAN"] },
  { node: 5, readout: 10 },
  { node: 6, readout: 11 },
];

const Code = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <bdi dir="ltr" className={`${styles.mono} ${className}`}>{children}</bdi>;

// EVENT -> ... -> NOTIFY with a failure branch off VERIFY. Every stage is selectable;
// a local, deterministic walk-through shows either the verified path or a failed
// verification that branches to the failure path and a human hand-off before it
// records and notifies. Nothing here contacts a live system.
export function ExecutionModel({ m, dir }: { m: Model; dir: "ltr" | "rtl" }) {
  const [mode, setMode] = useState<Mode>("manual");
  const [selected, setSelected] = useState(VERIFY);
  const frames = mode === "failure" ? failure : success;
  const { ref, frame, playing, play, pause } = useLiveFlow(frames.length, { stepMs: 620, onAutoplay: () => setMode("success") });
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const run = mode !== "manual";
  const reached = run ? frames.slice(0, frame + 1) : [];
  const current = run ? frames[Math.min(frame, frames.length - 1)] : undefined;
  const activeNode = run ? current?.node : selected;
  const failed = mode === "failure" && frame >= VERIFY;
  // The signal rests on the last stage reached (VERIFY while the failure branch runs).
  const signalAt = activeNode ?? [...reached].reverse().find(f => f.node !== undefined)?.node ?? VERIFY;
  const engaged = new Set(reached.flatMap(f => f.options ?? []));
  const count = m.nodes.length;
  const choose = (index: number) => { pause(); setMode("manual"); setSelected(index); };
  const start = (next: Exclude<Mode, "manual">) => { setMode(next); play(); };
  const nodeState = (index: number) => index === activeNode ? "active" : reached.some(f => f.node === index) ? "done" : undefined;
  const d = m.demo;
  const lines = [
    ...m.nodes.map((node, index) => [`${String(index + 1).padStart(2, "0")} ${node.code}`, d.success[index]]),
    [`05 VERIFY ✕`, d.failure.verify], ["RETRY", d.failure.retry], ["FALLBACK · ALERT · HUMAN", d.failure.handoff],
    ["06 RECORD", d.failure.record], ["07 NOTIFY", d.failure.notify],
  ];
  return (
    <div ref={ref} className={styles.execution} data-mode={mode} style={{ "--i": signalAt, "--n": count } as CSSProperties}>
      <div className={styles.modelBar}>
        {/* Both controls stay in place (the running one reads Pause), so the bar keeps
            its height and nothing below moves while a run plays. */}
        <div className={live.controls}>
          {(["success", "failure"] as const).map(kind => playing && mode === kind
            ? <button key={kind} type="button" className={live.control} data-playing onClick={pause}>{d.pause}</button>
            : <button key={kind} type="button" className={live.control} onClick={() => start(kind)}>{kind === "success" ? d.runSuccess : d.runFailure}</button>)}
        </div>
        <span className={live.tag}>{d.model}</span>
      </div>
      <Readout active={run ? current?.readout ?? 0 : selected} className={styles.modelReadout}
        items={lines.map(([code, text], index) => <p key={code} data-tone={index === 7 || index === 8 ? "failure" : index === 9 ? "human" : undefined}><Code>{code}</Code><span>{text}</span></p>)} />
      <div className={styles.flowTrack}>
        <span className={styles.flowSignal} aria-hidden="true" />
        <ol className={styles.flow}>
          {m.nodes.map((node, index) => (
            <li key={node.code} data-verify={node.code === "VERIFY" || undefined} data-state={nodeState(index)}
              data-result={index === VERIFY && reached.some(f => f.node === VERIFY) ? (mode === "failure" ? "fail" : "ok") : undefined}>
              <h3>
                <button ref={el => { buttons.current[index] = el; }} type="button" aria-pressed={mode === "manual" && selected === index}
                  onClick={() => choose(index)} onFocus={() => { if (mode !== "manual" || selected !== index) choose(index); }}
                  onPointerMove={event => { if (!playing && (mode !== "manual" || selected !== index) && intentionalHover(event)) choose(index); }}
                  onKeyDown={event => { const target = stepKey(event, index, count, dir); if (target >= 0) buttons.current[target]?.focus(); }}>
                  <Code className={styles.flowCode}>{`${String(index + 1).padStart(2, "0")} ${node.code}`}</Code>
                  <span>{node.label}</span>
                </button>
              </h3>
              <p className={styles.flowQuestion}>{node.question}</p>
              <ul className={`${styles.list} ${styles.flowExamples}`}>{node.examples.map(item => <li key={item}>{item}</li>)}</ul>
              {node.note && <p className={styles.flowNote}>{node.note}</p>}
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.failure} data-branch={failed || undefined}>
        <div>
          <Code className={styles.flowCode}>{`VERIFY ✕ → ${m.failure.code}`}</Code>
          <h3>{m.failure.label}</h3>
          <p className={styles.flowQuestion}>{m.failure.question}</p>
        </div>
        <ul>{m.failure.options.map(o => (
          <li key={o.code} data-human={o.code === "HUMAN" || undefined}
            data-state={current?.options?.includes(o.code) ? "active" : engaged.has(o.code) ? "done" : undefined}>
            <Code>{o.code}</Code>{o.label}
          </li>
        ))}</ul>
      </div>
    </div>
  );
}
