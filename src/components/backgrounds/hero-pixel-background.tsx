"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { preparePixelContext } from "./pixel-blast/webgl-context";
import {
  responsivePixelPreset,
  type HeroPixelPage,
} from "./hero-pixel-presets";
import styles from "./hero-pixel-background.module.css";

const PixelBlast = dynamic(() => import("./pixel-blast/pixel-blast"), {
  ssr: false,
});
const queries = [
  "(prefers-reduced-motion: reduce)",
  "(max-width: 700px)",
  "(max-width: 1024px)",
];
function subscribe(callback: () => void) {
  const media = queries.map((query) => window.matchMedia(query));
  media.forEach((query) => query.addEventListener("change", callback));
  return () =>
    media.forEach((query) => query.removeEventListener("change", callback));
}
function snapshot() {
  const [reduce, mobile, tablet] = queries.map(
    (query) => window.matchMedia(query).matches,
  );
  return `${reduce ? "static" : "animated"}:${mobile ? "mobile" : tablet ? "tablet" : "desktop"}`;
}
const serverSnapshot = () => "static:desktop";

export function HeroPixelBackground({ preset }: { preset: HeroPixelPage }) {
  const environment = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const animated = environment.startsWith("animated");
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    if (!animated) return;
    const check = () => setCapable(!!preparePixelContext());
    if (window.requestIdleCallback) {
      const handle = window.requestIdleCallback(check, { timeout: 600 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(check, 1);
    return () => window.clearTimeout(handle);
  }, [animated]);
  const size = environment.endsWith("mobile")
    ? "mobile"
    : environment.endsWith("tablet")
      ? "tablet"
      : "desktop";
  const { opacity, mask, ...props } = responsivePixelPreset(preset, size);
  return (
    <span
      className={styles.background}
      aria-hidden="true"
      data-hero-pixels={preset}
      data-motion={environment.startsWith("animated") ? "animated" : "static"}
      data-mask={mask}
      style={{ "--pixel-opacity": opacity } as CSSProperties}
    >
      <span className={styles.fallback} />
      {animated &&
        (capable ? (
          <PixelBlast key={preset} {...props} />
        ) : (
          <div data-pixel-engine="" data-state="fallback" />
        ))}
    </span>
  );
}
