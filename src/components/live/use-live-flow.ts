"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";

// Shared engine for the site's live system diagrams (System Flow, Automation by
// Design, the execution model, the feedback loop, the About chain, the customer
// journey). A diagram is a list of frames; the engine owns which frame is current.
//
// - Selection is immediate: one state update, no timers, no animation to wait for.
// - Playback is a short chain of timeouts (no animation-frame loop) that stops at
//   the last frame. It runs once when the diagram first comes into view, stops when
//   the diagram leaves the viewport or the tab is hidden, and can be replayed.
// - Reduced motion: no autoplay. A replay still steps through the states, and the
//   diagrams' CSS drops the travelling transitions.

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const media = matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
export const useReducedMotion = () => useSyncExternalStore(subscribeMotion, () => matchMedia(motionQuery).matches, () => false);

// One IntersectionObserver for every live diagram on the page. "in view" means a
// third of the diagram, or half the viewport for diagrams taller than the screen;
// "gone" means fully offscreen.
type Watch = (state: "in" | "gone" | "partial") => void;
const watchers = new Map<Element, Watch>();
let observer: IntersectionObserver | null = null;
function watchVisibility(element: Element, onChange: Watch) {
  observer ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      const viewport = entry.rootBounds?.height ?? innerHeight;
      const state = !entry.isIntersecting ? "gone" : entry.intersectionRatio >= 0.33 || entry.intersectionRect.height >= viewport * 0.5 ? "in" : "partial";
      watchers.get(entry.target)?.(state);
    }
  }, { threshold: [0, 0.2, 0.33, 0.5, 0.75] });
  watchers.set(element, onChange);
  observer.observe(element);
  return () => { watchers.delete(element); observer?.unobserve(element); };
}

export function useLiveFlow(length: number, { initial = 0, stepMs = 460, autoplay = true, onAutoplay }: { initial?: number; stepMs?: number; autoplay?: boolean; onAutoplay?: () => void } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [ran, setRan] = useState(false);
  const autoplayed = useRef(false);
  const onAutoplayRef = useRef(onAutoplay);
  useEffect(() => { onAutoplayRef.current = onAutoplay; });

  useEffect(() => {
    if (!playing) return;
    const last = frame >= length - 1;
    const timer = setTimeout(() => (last ? setPlaying(false) : setFrame(value => value + 1)), stepMs);
    return () => clearTimeout(timer);
  }, [playing, frame, length, stepMs]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const stopIfHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", stopIfHidden);
    const unwatch = watchVisibility(element, state => {
      if (state === "gone") { setPlaying(false); return; }
      if (state !== "in" || !autoplay || autoplayed.current || matchMedia(motionQuery).matches) return;
      autoplayed.current = true;
      onAutoplayRef.current?.();
      setFrame(0); setRan(true); setPlaying(true);
    });
    return () => { unwatch(); document.removeEventListener("visibilitychange", stopIfHidden); };
  }, [autoplay]);

  const play = useCallback(() => { autoplayed.current = true; setFrame(0); setRan(true); setPlaying(true); }, []);
  const pause = useCallback(() => setPlaying(false), []);
  const select = useCallback((index: number) => { autoplayed.current = true; setPlaying(false); setFrame(index); }, []);
  return { ref, frame, playing, ran, reduced, play, pause, select };
}

// Arrow keys follow the reading direction (and Down/Up for stacked layouts);
// Home/End jump to the ends. Returns -1 for any other key.
export function stepKey(event: KeyboardEvent, index: number, count: number, dir: "ltr" | "rtl") {
  const forward = event.key === "ArrowDown" || event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight");
  const back = event.key === "ArrowUp" || event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft");
  const target = forward ? Math.min(index + 1, count - 1)
    : back ? Math.max(index - 1, 0)
    : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : -1;
  if (target >= 0) event.preventDefault();
  return target;
}

// Mouse hover previews a stage only on a real pointer movement (content scrolling
// under a resting cursor must not jump the selection), and never while a
// demonstration plays: a click takes control, a passing pointer does not.
// Compared against the last pointer position (movementX/Y is not reliable across
// input sources): a synthetic move after scrolling keeps the same coordinates.
let lastPointer = { x: NaN, y: NaN };
export function intentionalHover(event: { pointerType: string; clientX: number; clientY: number }) {
  const moved = event.clientX !== lastPointer.x || event.clientY !== lastPointer.y;
  lastPointer = { x: event.clientX, y: event.clientY };
  return event.pointerType === "mouse" && moved;
}
