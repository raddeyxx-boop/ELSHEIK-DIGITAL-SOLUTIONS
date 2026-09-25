"use client";

import { useRef, type CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { JourneyDetail } from "@/content/case-studies/relax-moon";
import { intentionalHover, stepKey, useLiveFlow } from "@/components/live/use-live-flow";
import { PlaybackControl, Readout } from "@/components/live/live-parts";
import styles from "./customer-journey.module.css";

type DetailLabels = Record<keyof JourneyDetail, string>;
const fields = ["input", "action", "decision", "data", "next"] as const;
const copy = {
  en: { list: "Customer journey stages", selected: "Selected stage", controls: { run: "Play journey", replay: "Replay", pause: "Pause" } },
  ar: { list: "مراحل رحلة العميل", selected: "المرحلة المحددة", controls: { run: "شغّل الرحلة", replay: "أعد التشغيل", pause: "إيقاف مؤقت" } },
};

// Eight booking stages. Selecting one (click, tap, focus, arrow keys or mouse hover)
// updates the detail panel in the same interaction; a short demonstration moves a
// lime indicator through the stages once when the journey first comes into view.
// Detail changes are not announced as they autoplay; the stage buttons carry the state.
export function CustomerJourney({ steps, locale = "en", details, detailLabels }: { steps: string[]; locale?: Locale; details?: JourneyDetail[]; detailLabels?: DetailLabels }) {
  const l = copy[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const count = steps.length;
  const { ref, frame, playing, ran, play, pause, select } = useLiveFlow(count, { stepMs: 520 });
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const number = (index: number) => String(index + 1).padStart(2, "0");
  const detailFor = (index: number) => {
    const detail = details?.[index];
    return <div key={steps[index]}>
      <p className={styles.detail}><span>{number(index)}</span>{`${l.selected}: ${steps[index]}`}</p>
      {detail && detailLabels && <dl className={styles.panel}>
        {fields.filter(key => detail[key]).map(key => <div key={key} data-field={key}><dt>{detailLabels[key]}</dt><dd>{detail[key]}</dd></div>)}
      </dl>}
    </div>;
  };
  return (
    <div ref={ref} className={styles.live} style={{ "--i": frame, "--n": count } as CSSProperties}>
      <div className={styles.bar}>
        <PlaybackControl labels={l.controls} playing={playing} ran={ran} onPlay={play} onPause={pause} />
      </div>
      <div className={styles.track}>
        <span className={styles.progress} aria-hidden="true" />
        <span className={styles.signal} aria-hidden="true" />
        <ol className={styles.journey} aria-label={l.list}>
          {steps.map((step, index) => (
            <li key={step} data-state={index === frame ? "active" : index < frame ? "done" : undefined}>
              <button ref={el => { buttons.current[index] = el; }} type="button" aria-pressed={frame === index} aria-controls="journey-stage-detail"
                onClick={() => select(index)} onFocus={() => { if (index !== frame) select(index); }}
                onPointerMove={event => { if (!playing && index !== frame && intentionalHover(event)) select(index); }}
                onKeyDown={event => { const target = stepKey(event, index, count, dir); if (target >= 0) buttons.current[target]?.focus(); }}>
                <span>{number(index)}</span><strong>{step}</strong>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Readout id="journey-stage-detail" active={frame} items={steps.map((_, index) => detailFor(index))} />
    </div>
  );
}
