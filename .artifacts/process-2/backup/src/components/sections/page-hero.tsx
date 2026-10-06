import styles from "./page.module.css";
import { HeroPixelBackground } from "@/components/backgrounds/hero-pixel-background";
import type { HeroPixelPage } from "@/components/backgrounds/hero-pixel-presets";
export function PageHero({ eyebrow, title, lead, preset = "services" }: { eyebrow: string; title: string; lead: string; preset?: HeroPixelPage }) { return <header className={styles.hero} data-pixel-hero={preset}><HeroPixelBackground preset={preset}/><div className="shell"><span className="eyebrow">{eyebrow}</span><h1 className="display">{title}</h1><p className="lead">{lead}</p></div></header>; }
