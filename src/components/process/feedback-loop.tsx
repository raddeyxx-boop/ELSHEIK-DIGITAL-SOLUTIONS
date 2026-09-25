"use client";

import { useRef, useState } from "react";
import { stepKey, useLiveFlow } from "@/components/live/use-live-flow";
import { PlaybackControl, Readout } from "@/components/live/live-parts";
import styles from "./process.module.css";

type Stage = { id: string; number: string; title: string; short: string };
type Loop = { arcLabel: string; center: string; stagesLabel: string; controls: { run: string; replay: string; pause: string } };
const EVIDENCE = 8;
// Frames of one run: the eight stages, the new-evidence arc, then back to Discovery.
const FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, EVIDENCE, 0];

// The ring never rotates; one signal travels around it. In a run it steps stage by
// stage, crosses the new-evidence arc and returns to 01. Selecting a stage (the
// buttons below, or the stage on the ring) moves the signal there directly.
export function FeedbackLoop({ stages, loop, evidenceNote, dir }: { stages: Stage[]; loop: Loop; evidenceNote: string; dir: "ltr" | "rtl" }) {
  const [selected, setSelected] = useState(EVIDENCE);
  const [mode, setMode] = useState<"manual" | "run">("manual");
  const { ref, frame, playing, ran, play, pause } = useLiveFlow(FRAMES.length, { stepMs: 480, onAutoplay: () => setMode("run") });
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = mode === "run" ? FRAMES[frame] : selected;
  const returned = mode === "run" && frame === FRAMES.length - 1;
  const choose = (index: number) => { pause(); setMode("manual"); setSelected(index); };
  const start = () => { setMode("run"); play(); };

  // Geometry: eight stages on a ring, mirrored for RTL so the sequence reads in the page direction.
  const cx = 260, cy = 210, r = 128, sign = dir === "rtl" ? -1 : 1;
  const point = (i: number, radius = r) => {
    const a = ((-90 + sign * i * 45) * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };
  const [sx, sy] = point(7.18), [ex, ey] = point(8 - 0.3);
  // SVG text-anchor follows the inherited direction, so "start" is the right edge in RTL.
  const side = (x: number) => ((x < cx) === (dir === "rtl") ? "start" : "end");
  const [lx, ly] = point(7.5, r + 34);
  // Signal angle: a run accumulates (…, 337.5 on the arc, 360 back at 01) so it only
  // ever travels forward; a direct selection jumps without a transition.
  const turns = mode === "run" ? (frame === FRAMES.length - 1 ? 8 : FRAMES[frame] === EVIDENCE ? 7.5 : FRAMES[frame]) : current === EVIDENCE ? 7.5 : current;
  const travelling = mode === "run" && playing && frame > 0;
  // Run: stages already passed are done. Selecting the new-evidence arc marks the two
  // stages it joins (08 feeds 01).
  const stateOf = (i: number) => {
    if (i === current) return "active";
    if (mode === "run") return returned || current === EVIDENCE || i < current ? "done" : undefined;
    return current === EVIDENCE && (i === 0 || i === 7) ? "edge" : undefined;
  };

  const items = [...stages.map(s => <p key={s.id}><bdi dir="ltr">{s.number}</bdi><strong>{s.title}</strong><span>{s.short}</span></p>),
    <p key="evidence"><bdi dir="ltr">{`${stages[7].number} → ${stages[0].number}`}</bdi><strong>{loop.arcLabel}</strong><span>{evidenceNote}</span></p>];
  return (
    <div ref={ref} className={styles.loopLive} data-travel={travelling || undefined}>
      <svg className={styles.loopSvg} viewBox="0 0 520 420" role="img" aria-label={`${stages[7].number} ${stages[7].title} → ${loop.arcLabel} → ${stages[0].number} ${stages[0].title}`}>
        <defs>
          <marker id="loop-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill="var(--accent)" />
          </marker>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-bright)" />
        <path className={styles.loopArcPath} data-active={current === EVIDENCE || undefined} d={`M${sx} ${sy} A${r} ${r} 0 0 ${sign > 0 ? 1 : 0} ${ex} ${ey}`} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#loop-arrow)" />
        <text x={lx} y={ly} textAnchor={side(lx)} className={styles.loopArc} data-active={current === EVIDENCE || undefined}>{loop.arcLabel}</text>
        {stages.map((stage, i) => {
          const [x, y] = point(i), [tx, ty] = point(i, r + 22);
          const anchor = Math.abs(tx - cx) < 4 ? "middle" : side(tx);
          return (
            <g key={stage.id} className={styles.loopNode} data-state={stateOf(i)} onClick={() => choose(i)}>
              <circle cx={x} cy={y} r="14" fill="transparent" />
              <circle className={styles.loopDot} cx={x} cy={y} r={i === 0 || i === 7 ? 6 : 4.5} />
              <text x={tx} y={ty + (i === 0 ? -8 : i === 4 ? 16 : 5)} textAnchor={anchor} className={styles.loopLabel}>
                <tspan className={styles.loopNumber}>{stage.number}</tspan>{` ${stage.title}`}
              </text>
            </g>
          );
        })}
        <g className={styles.loopSignal} style={{ transform: `rotate(${sign * turns * 45}deg)` }} aria-hidden="true">
          <circle cx={cx} cy={cy - r} r="9" fill="none" stroke="var(--accent)" strokeOpacity=".35" />
          <circle cx={cx} cy={cy - r} r="4" fill="var(--accent)" />
        </g>
        <text x={cx} y={cy + 5} textAnchor="middle" className={styles.loopCenter}>{loop.center}</text>
      </svg>
      <div className={styles.loopControls}>
        <div className={styles.loopStages} role="group" aria-label={loop.stagesLabel}>
          {[...stages.map(s => ({ key: s.id, text: s.number, name: `${s.number} ${s.title}` })), { key: "evidence", text: loop.arcLabel, name: loop.arcLabel }].map((item, index) => (
            <button key={item.key} ref={el => { buttons.current[index] = el; }} type="button" aria-label={item.name} aria-pressed={mode === "manual" && selected === index}
              data-state={index === current ? "active" : undefined} data-evidence={index === EVIDENCE || undefined}
              onClick={() => choose(index)} onFocus={() => { if (mode !== "manual" || selected !== index) choose(index); }}
              onKeyDown={event => { const target = stepKey(event, index, stages.length + 1, dir); if (target >= 0) buttons.current[target]?.focus(); }}>
              <bdi dir="ltr">{item.text}</bdi>
            </button>
          ))}
        </div>
        <PlaybackControl labels={loop.controls} playing={playing} ran={ran} onPlay={start} onPause={pause} />
      </div>
      <Readout active={current} className={styles.loopReadout} items={items} />
    </div>
  );
}
