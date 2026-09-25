"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/live/use-live-flow";
import styles from "./system-experiences.module.css";

// The case study's "system in action" lab. It needs only the reduced-motion
// preference, so it no longer pulls the motion library into the case-study bundle.
const labSteps = [
  "REQUEST RECEIVED",
  "INPUT VALIDATED",
  "AVAILABILITY CHECKED",
  "DECISION MADE",
  "RECORD SYNCHRONIZED",
  "NOTIFICATION DISPATCHED",
];
export function AutomationLab({ locale }: { locale: "en" | "ar" }) {
  const reduce = useReducedMotion(),
    [running, setRunning] = useState(false),
    [active, setActive] = useState(-1);
  useEffect(() => {
    if (!running) return;
    if (active >= labSteps.length - 1) {
      const done = setTimeout(() => setRunning(false), 700);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setActive((v) => v + 1), reduce ? 30 : 520);
    return () => clearTimeout(timer);
  }, [running, active, reduce]);
  const run = () => {
    setActive(0);
    setRunning(true);
  };
  return (
    <div className={styles.lab}>
      <div className={styles.labHead}>
        <div>
          <span>LOCAL SIMULATION / NO EXTERNAL CALLS</span>
          <strong>
            {locale === "ar"
              ? "شاهد النظام يتخذ القرار"
              : "WATCH A SYSTEM THINK"}
          </strong>
        </div>
        <button type="button" onClick={run} disabled={running}>
          {running
            ? locale === "ar"
              ? "قيد التنفيذ"
              : "RUNNING"
            : locale === "ar"
              ? "شغّل الأتمتة"
              : "RUN AUTOMATION"}
        </button>
      </div>
      <ol>
        {labSteps.map((step, i) => (
          <li key={step} className={i <= active ? styles.complete : ""}>
            <span>0{i + 1}</span>
            <strong>{step}</strong>
            <i />
          </li>
        ))}
      </ol>
      <p>
        {locale === "ar"
          ? "محاكاة ببيانات محلية وهمية فقط. لا يتم إرسال أو تخزين أي شيء."
          : "Presentation-only simulation using local, fictional data. Nothing is sent or stored."}
      </p>
    </div>
  );
}
