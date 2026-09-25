"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { motion, useIsPresent } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CodeXml,
  CreditCard,
  Database,
  Home,
  Layers,
  LayoutDashboard,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
  UserRound,
  Workflow,
  Package,
  Globe,
  Signal,
  BatteryFull,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { previewCopy, type PreviewKind } from "./preview-content";
import { sceneCopy, type SceneCopy } from "./scene-content";
import styles from "./service-preview.module.css";

const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const snapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => false;
type SceneProps = { c: SceneCopy; stage: number };
const delay = (i: number) => ({ "--delay": `${i * 0.18}s` }) as CSSProperties;

function MobileApplicationPreview({ c, stage }: SceneProps) {
  return (
    <div className={styles.mobileScene}>
      <div className={styles.devicePlane}>
        <Layers />
        <span>{c.operations}</span>
        <strong>04 / 12</strong>
        <div className={styles.planeLine} />
        <small>{c.syncedDevice}</small>
      </div>
      <div className={styles.phone} data-device="phone">
        <div className={styles.phoneStatus}>
          <span>9:41</span>
          <i />
          <span>
            <Signal />
            <BatteryFull />
          </span>
        </div>
        <div className={styles.phoneScreen}>
          <div className={styles.appGreeting}>
            <small>{c.morning}</small>
            <UserRound />
          </div>
          <strong className={styles.appTitle}>{c.today}</strong>
          <div className={styles.appMetrics}>
            <div>
              <b>04</b>
              <small>{c.bookings}</small>
            </div>
            <div>
              <b>12</b>
              <small>{c.tasks}</small>
            </div>
            <div>
              <b>03</b>
              <small>{c.requests}</small>
            </div>
          </div>
          <div className={styles.booking} data-selected={stage >= 2}>
            <span>
              <CalendarDays />
              {c.booking}
            </span>
            <small>10:30 — 11:00</small>
            <div>
              <span className={styles.avatar}>04</span>
              <span>
                {stage >= 4 ? c.confirmed : stage >= 2 ? c.selected : c.pending}
              </span>
            </div>
          </div>
          <div className={styles.appAction} data-pressed={stage === 3}>
            {stage >= 4 ? <CheckCheck /> : <Check />}
            {stage >= 4 ? c.done : c.assignment}
          </div>
          <div className={styles.phoneNav}>
            {[
              [Home, c.home],
              [CalendarDays, c.bookings],
              [UserRound, c.profile],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof Home;
              return (
                <span key={i}>
                  <I />
                  <small>{label as string}</small>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
function WebApplicationPreview({ c, stage }: SceneProps) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardTop}>
        <Layers />
        <strong>{c.operations}</strong>
        <span>
          <Search />
          {c.search}
        </span>
      </div>
      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          {[
            [LayoutDashboard, c.overview],
            [Users, c.customers],
            [Workflow, c.workflows],
            [Activity, c.reports],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Home;
            return (
              <div key={i} data-selected={i === 0 && stage >= 1}>
                <I />
                <span>{label as string}</span>
              </div>
            );
          })}
          <small dir="ltr">ELSHEIK</small>
        </aside>
        <div className={styles.dashboardMain}>
          <strong>{c.dashboard}</strong>
          <div className={styles.metrics}>
            {[c.active, c.open, c.completed].map((label, i) => (
              <div key={label}>
                <small>{label}</small>
                <b>{["12", "04", stage >= 4 ? "29" : "28"][i]}</b>
                <span className={styles.metricLine} />
              </div>
            ))}
          </div>
          <div className={styles.tableTitle}>
            {c.activity}
            <Activity />
          </div>
          <div className={styles.activityRows}>
            {[c.requestId, c.booking, c.reports].map((label, i) => (
              <div key={label} className={styles.enter} style={delay(i + 2)}>
                <span>{label}</span>
                <span data-success={i !== 0 || stage >= 4}>
                  {i === 0 ? (stage >= 4 ? c.done : c.pending) : c.saved}
                </span>
                <ChevronRight />
              </div>
            ))}
          </div>
          <div className={styles.review} data-complete={stage >= 4}>
            {stage >= 4 ? <CheckCheck /> : <ShieldCheck />}
            {stage >= 4 ? c.reviewed : c.review}
          </div>
        </div>
      </div>
    </div>
  );
}
function WebDevelopmentPreview({ c, stage }: SceneProps) {
  return (
    <div className={styles.webScene}>
      <div className={styles.browser} data-built={stage >= 2}>
        <div className={styles.browserChrome}>
          <span>● ● ●</span>
          <small>
            <Globe /> studio.example
          </small>
          <CodeXml />
        </div>
        <div className={styles.website}>
          <div className={styles.siteNav}>
            <b>{c.website}</b>
            <span>
              {c.collection}
              <ArrowUpRight />
            </span>
          </div>
          <div className={styles.siteHero}>
            <div>
              <strong>{c.spaces}</strong>
              <span>{c.websiteText}</span>
              <div className={styles.siteCta}>
                {c.explore}
                <ArrowUpRight />
              </div>
            </div>
            <div className={styles.architectureArt}>
              <i />
              <i />
              <i />
              <span>01 / 03</span>
            </div>
          </div>
          <div className={styles.siteCards}>
            <span>
              <i />
              {c.living}
              <ArrowUpRight />
            </span>
            <span>
              <i />
              {c.work}
              <ArrowUpRight />
            </span>
          </div>
        </div>
      </div>
      <div className={styles.buildSteps}>
        {[c.design, c.build, c.responsive].map((s, i) => (
          <span key={s} data-complete={stage >= i + 1}>
            <Check />
            {s}
          </span>
        ))}
        <Smartphone />
      </div>
    </div>
  );
}
function AutomationPreview({ c, stage }: SceneProps) {
  const nodes = [
    { icon: Send, label: c.request, role: c.form },
    { icon: Workflow, label: "n8n", role: c.workflow },
    { icon: CodeXml, label: "API", role: c.api },
    { icon: Database, label: "Supabase", role: c.data },
    { icon: Bell, label: c.notification, role: c.notifyRole },
  ];
  return (
    <div className={styles.automation} data-sequence-stage={stage}>
      <div className={styles.systemTitle}>
        <Workflow />
        <strong>{c.execution}</strong>
        <span>04</span>
      </div>
      <div className={styles.workflow} dir="ltr">
        <svg
          className={styles.flowPath}
          viewBox="0 0 500 190"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M83 47H417V143H166" />
          <path className={styles.pathProgress} d="M83 47H417V143H166" />
          {stage < 4 && (
            <circle r="5" className={styles.signal} data-signal="automation">
              <animateMotion
                dur="3.4s"
                fill="freeze"
                calcMode="linear"
                keyPoints="0;0.245;0.49;0.631;1"
                keyTimes="0;0.191;0.441;0.720;1"
                path="M83 47H417V143H166"
              />
            </circle>
          )}
        </svg>
        {nodes.map(({ icon: Icon, label, role }, i) => (
          <div
            className={styles.flowNode}
            key={label}
            data-node={i}
            data-arrived={stage >= i}
            style={{
              gridArea: ["1 / 1", "1 / 2", "1 / 3", "2 / 3", "2 / 1 / 3 / 3"][
                i
              ],
            }}
          >
            <div className={stage === i ? styles.pulse : undefined}>
              <Icon />
            </div>
            <strong dir="auto">{label}</strong>
            <small dir="auto">{role}</small>
          </div>
        ))}
      </div>
      <div className={styles.executionResult} data-complete={stage >= 4}>
        <CheckCheck />
        {stage >= 4 ? c.delivered : c.logic}
        <span>{stage >= 4 ? "05 / 05" : "0" + (stage + 1) + " / 05"}</span>
      </div>
    </div>
  );
}
function AIPreview({ c, stage }: SceneProps) {
  return (
    <div className={styles.aiScene} data-sequence-stage={Math.min(stage, 3)}>
      <div className={styles.systemTitle}>
        <Settings2 />
        <strong>{c.input}</strong>
        <span>04</span>
      </div>
      <div className={styles.inputs}>
        {[c.context, c.priority].map((label, i) => (
          <div
            key={label}
            className={styles.enter}
            style={delay(i)}
            data-selected={stage >= 1}
          >
            <small>{label}</small>
            <strong>{i ? c.urgent : c.account}</strong>
            <Check />
          </div>
        ))}
      </div>
      <div className={styles.processing} data-complete={stage >= 2}>
        <span />
        <Settings2 />
        <div>
          <strong>{stage >= 2 ? c.signal : c.processing}</strong>
          <small>{c.rules}</small>
        </div>
        <span />
      </div>
      <div className={styles.candidates}>
        <small>{c.candidates}</small>
        <div>
          <span className={stage >= 3 ? styles.dismissed : undefined}>
            {c.general}
          </span>
          <span data-selected={stage >= 3}>
            {c.specialist}
            <Check />
          </span>
        </div>
      </div>
      <div className={styles.decision} data-complete={stage >= 4}>
        <small>{c.decision}</small>
        <strong>{stage >= 4 ? c.specialist : c.processing}</strong>
        <ShieldCheck />
      </div>
    </div>
  );
}
function CustomSoftwarePreview({ c, stage }: SceneProps) {
  const modules = [
    { icon: Users, label: c.crm },
    { icon: Activity, label: c.operations },
    { icon: CreditCard, label: c.payments },
    { icon: Package, label: c.inventory },
    { icon: LayoutDashboard, label: c.reports },
    { icon: Globe, label: c.portal },
  ];
  return (
    <div className={styles.platform} data-connected={stage >= 3}>
      <div className={styles.systemTitle}>
        <Layers />
        <strong>{c.platform}</strong>
      </div>
      <div className={styles.moduleGrid}>
        {modules.map(({ icon: Icon, label }, i) => (
          <div key={label} className={styles.enter} style={delay(i)}>
            <Icon />
            <strong>{label}</strong>
            <small>{stage >= 3 ? c.synchronized : c.queued}</small>
            <i data-connected={stage >= 2} />
          </div>
        ))}
      </div>
      <div className={styles.systemBus} data-complete={stage >= 3}>
        <Database />
        <span>{c.synced}</span>
        <CheckCheck />
      </div>
      <div className={styles.platformStatus} data-complete={stage >= 4}>
        <span />
        {stage >= 4 ? c.live : c.connected}
      </div>
    </div>
  );
}
const scenes = {
  web: WebDevelopmentPreview,
  apps: WebApplicationPreview,
  mobile: MobileApplicationPreview,
  automation: AutomationPreview,
  ai: AIPreview,
  software: CustomSoftwarePreview,
};
export function ServicePreview({
  kind,
  locale,
}: {
  kind: PreviewKind;
  locale: Locale;
}) {
  const reduced = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const present = useIsPresent();
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (reduced || !present) return;
    const timers = [650, 1500, 2450, 3400].map((ms, i) =>
      setTimeout(() => setStage(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduced, present]);
  const Scene = scenes[kind];
  return (
    <motion.div
      className={styles.preview}
      role="img"
      aria-label={previewCopy[locale].descriptions[kind]}
      data-service-preview={kind}
      data-running={present && !reduced && stage < 4}
      data-reduced={reduced}
      data-stage={reduced ? 4 : stage}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -6 }}
      transition={{ duration: reduced ? 0 : 0.28 }}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className={styles.sceneCaption}>
        <span>{sceneCopy[locale].demo}</span>
        <span className={styles.statusDot} />
      </div>
      <Scene c={sceneCopy[locale]} stage={reduced ? 4 : stage} />
    </motion.div>
  );
}
