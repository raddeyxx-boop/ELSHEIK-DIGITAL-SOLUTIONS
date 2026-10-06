"use client";

import { useState } from "react";
import { intentionalHover } from "@/components/live/use-live-flow";
import styles from "./process.module.css";

type Stage = { id: string; number: string; title: string };
// Stage index -> phase: 01-04 foundation, 05 orchestration, 06 verification,
// 07 operation, 08 learning.
const phaseOf = [0, 0, 0, 0, 1, 2, 3, 4];
const CORE = 4;

// Automation depends on the stages before it and is followed by the stages after
// it. Selecting a stage shows that relationship: earlier stages read as the path
// already travelled, the stage itself is active, and the phase tags light up for
// the whole chain when Automation (05) is selected. Hover previews; leaving the
// list returns to the selected stage.
export function AutomationMatrix({ stages, rows, phases, label }: { stages: Stage[]; rows: string[]; phases: string[]; label: string }) {
  const [selected, setSelected] = useState(CORE);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? selected;
  return (
    <ol className={styles.matrix} aria-label={label} onPointerLeave={() => setPreview(null)}>
      {stages.map((stage, index) => (
        <li key={stage.id} data-core={index === CORE || undefined}
          data-state={index === shown ? "active" : index < shown ? "done" : undefined}
          data-lit={shown === CORE || phaseOf[index] === phaseOf[shown] || index === CORE || undefined}>
          <button type="button" aria-pressed={index === selected}
            onClick={() => { setSelected(index); setPreview(null); }} onFocus={() => setSelected(index)}
            onPointerMove={event => { if (index !== shown && intentionalHover(event)) setPreview(index); }}>
            <bdi dir="ltr" className={styles.mono}>{stage.number}</bdi>
            <span className={styles.matrixStage}>{stage.title}</span>
            <span className={styles.matrixRole}>{rows[index]}</span>
            <span className={styles.matrixPhase}>{phases[phaseOf[index]]}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
