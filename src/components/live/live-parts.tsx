import type { ReactNode } from "react";
import styles from "./live.module.css";

// Reserves the height of the tallest state, so switching stages (by the visitor or
// by a demonstration) never moves the content below. The visible copy is the
// current state; the sizer holds every state invisibly and is hidden from
// assistive technology.
export function Readout({ id, items, active, className = "" }: { id?: string; items: ReactNode[]; active: number; className?: string }) {
  return (
    <div className={`${styles.readout} ${className}`}>
      <div id={id} className={styles.readoutCurrent}>{items[active]}</div>
      <div className={styles.sizer} aria-hidden="true" inert>
        {items.map((item, index) => <div key={index}>{item}</div>)}
      </div>
    </div>
  );
}

export type PlaybackLabels = { run: string; replay: string; pause: string };

// Text-only playback control: Run on first use, Replay after a run, Pause while playing.
export function PlaybackControl({ labels, playing, ran, onPlay, onPause, children }: { labels: PlaybackLabels; playing: boolean; ran: boolean; onPlay: () => void; onPause: () => void; children?: ReactNode }) {
  return (
    <div className={styles.controls}>
      {playing
        ? <button type="button" className={styles.control} data-playing onClick={onPause}>{labels.pause}</button>
        : <button type="button" className={styles.control} onClick={onPlay}>{ran ? labels.replay : labels.run}</button>}
      {children}
    </div>
  );
}
