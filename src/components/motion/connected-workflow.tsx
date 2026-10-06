"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView } from "motion/react";
import {
  AppWindow,
  Check,
  CodeXml,
  Database,
  Send,
  UserRound,
  Share2,
} from "lucide-react";
import styles from "./connected-workflow.module.css";

type Point = [number, number];
type Curve = [Point, Point, Point, Point];
const nodes = [
  {
    id: "user",
    en: "User",
    ar: "العميل",
    meta: ["Request", "طلب"],
    Icon: UserRound,
    arrival: 0,
  },
  {
    id: "next",
    en: "Next.js",
    ar: "Next.js",
    meta: ["Interface", "الواجهة"],
    Icon: AppWindow,
    arrival: 1,
  },
  {
    id: "api",
    en: "API",
    ar: "API",
    meta: ["Request", "الطلب"],
    Icon: CodeXml,
    arrival: 2,
  },
  {
    id: "n8n",
    en: "n8n",
    ar: "n8n",
    meta: ["Automation", "الأتمتة"],
    Icon: Share2,
    arrival: 3,
  },
  {
    id: "supabase",
    en: "Supabase",
    ar: "Supabase",
    meta: ["Backend", "الخلفية"],
    Icon: Database,
    arrival: 1,
  },
  {
    id: "postgres",
    en: "PostgreSQL",
    ar: "PostgreSQL",
    meta: ["Database", "قاعدة البيانات"],
    Icon: Database,
    arrival: 2,
  },
  {
    id: "notify",
    en: "Notification",
    ar: "الإشعار",
    meta: ["WhatsApp / Email", "واتساب / البريد"],
    Icon: Send,
    arrival: 4,
  },
] as const;
const copy = {
  en: {
    title: "LIVE SIMULATION",
    label: "Animated automation workflow",
    steps: [
      "Request received",
      "Processing with n8n",
      "Checking availability",
      "Saving to database",
      "Notification sent",
    ],
    run: "RUN AUTOMATION",
    running: "AUTOMATION RUNNING",
    replay: "REPLAY AUTOMATION",
  },
  ar: {
    title: "محاكاة مباشرة",
    label: "مسار أتمتة تفاعلي",
    steps: [
      "تم استلام الطلب",
      "المعالجة عبر n8n",
      "التحقق من التوفر",
      "الحفظ في قاعدة البيانات",
      "تم إرسال الإشعار",
    ],
    run: "تشغيل الأتمتة",
    running: "جاري تشغيل الأتمتة",
    replay: "إعادة التشغيل",
  },
};
const desktop: Point[] = [
  [55, 160],
  [220, 65],
  [380, 65],
  [550, 65],
  [250, 245],
  [440, 245],
  [790, 160],
];
const mobile: Point[] = [
  [165, 48],
  [75, 177],
  [75, 316],
  [75, 455],
  [255, 177],
  [255, 316],
  [165, 598],
];
const edges = [
  { from: 0, to: 1, phase: 0 },
  { from: 0, to: 4, phase: 0 },
  { from: 1, to: 2, phase: 1 },
  { from: 4, to: 5, phase: 1 },
  { from: 2, to: 3, phase: 2 },
  { from: 3, to: 6, phase: 3 },
  { from: 5, to: 6, phase: 3 },
];
function curve(from: Point, to: Point, vertical: boolean): Curve {
  return vertical
    ? [
        from,
        [from[0], (from[1] + to[1]) / 2],
        [to[0], (from[1] + to[1]) / 2],
        to,
      ]
    : [
        from,
        [(from[0] + to[0]) / 2, from[1]],
        [(from[0] + to[0]) / 2, to[1]],
        to,
      ];
}
function route(
  edge: (typeof edges)[number],
  positions: Point[],
  vertical: boolean,
): Curve[] {
  if (!vertical && edge.phase === 3) {
    const merge: Point = [650, 245];
    return [
      curve(positions[edge.from], merge, false),
      curve(merge, positions[edge.to], false),
    ];
  }
  return [curve(positions[edge.from], positions[edge.to], vertical)];
}
function path(curves: Curve[]) {
  return `M${curves[0][0]} ${curves.map((c) => `C${c[1]} ${c[2]} ${c[3]}`).join(" ")}`;
}
function samples(curves: Curve[]) {
  const points = curves.flatMap((c) =>
    Array.from({ length: 41 }, (_, index) => {
      const t = index / 40,
        u = 1 - t;
      return [0, 1].map(
        (axis) =>
          u ** 3 * c[0][axis] +
          3 * u * u * t * c[1][axis] +
          3 * u * t * t * c[2][axis] +
          t ** 3 * c[3][axis],
      );
    }),
  );
  return {
    cx: points.map((point) => point[0]),
    cy: points.map((point) => point[1]),
  };
}
function WorkflowMap({
  locale,
  vertical,
  phase,
  running,
  runId,
  reduce,
  arrive,
}: {
  locale: "en" | "ar";
  vertical: boolean;
  phase: number;
  running: boolean;
  runId: number;
  reduce: boolean;
  arrive: (next: number) => void;
}) {
  const positions = vertical ? mobile : desktop;
  const leadingEdge = edges.findIndex((edge) => edge.phase === phase);
  return (
    <svg
      className={`${styles.map} ${vertical ? styles.mobile : styles.desktop}`}
      viewBox={vertical ? "0 0 330 690" : "0 0 850 330"}
      role="img"
      aria-label={copy[locale].label}
      data-testid={vertical ? "workflow-mobile" : "workflow-desktop"}
    >
      <title>{copy[locale].label}</title>
      {edges.map((edge, index) => (
        <path
          key={index}
          className={styles.connection}
          d={path(route(edge, positions, vertical))}
        />
      ))}
      {running &&
        !reduce &&
        edges.map(
          (edge, index) =>
            edge.phase === phase && (
              <motion.circle
                key={`${runId}-${index}`}
                className={styles.signal}
                r="4.5"
                initial={{
                  cx: positions[edge.from][0],
                  cy: positions[edge.from][1],
                }}
                animate={samples(route(edge, positions, vertical))}
                transition={{ duration: 0.76, ease: "linear" }}
                onAnimationComplete={
                  index === leadingEdge ? () => arrive(phase + 1) : undefined
                }
                data-destination={nodes[edge.to].id}
              />
            ),
        )}
      {nodes.map((node, index) => {
        const lit = reduce || node.arrival <= phase;
        const pulse = !reduce && running && node.arrival === phase;
        const [x, y] = positions[index];
        return (
          <g
            key={node.id}
            transform={`translate(${x} ${y})`}
            className={`${styles.node} ${lit ? styles.lit : ""}`}
            data-node={node.id}
            data-arrived={lit}
            data-pulsing={pulse}
          >
            {pulse && <circle key={runId} className={styles.pulse} r="26" />}
            <circle
              className={`${styles.ring} ${pulse ? styles.impact : ""}`}
              r="24"
            />
            <node.Icon
              className={styles.icon}
              x={-11}
              y={-11}
              width={22}
              height={22}
              aria-hidden="true"
            />
            <text
              className={styles.label}
              y="43"
              textAnchor="middle"
              direction={locale === "ar" ? "rtl" : "ltr"}
            >
              {node[locale]}
            </text>
            <text
              className={styles.meta}
              y="61"
              textAnchor="middle"
              direction={locale === "ar" ? "rtl" : "ltr"}
            >
              {node.meta[locale === "ar" ? 1 : 0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverMotionSnapshot = () => false;

export function ConnectedWorkflow({ locale }: { locale: "en" | "ar" }) {
  const reduce = useSyncExternalStore(
      subscribeMotion,
      motionSnapshot,
      serverMotionSnapshot,
    ),
    ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: "-15%" });
  const hasAutoRun = useRef(false);
  const [phase, setPhase] = useState(0),
    [running, setRunning] = useState(false),
    [runId, setRunId] = useState(0);
  const l = copy[locale];
  useEffect(() => {
    if (!visible || reduce || hasAutoRun.current) return;
    const timer = setTimeout(() => {
      hasAutoRun.current = true;
      setRunning(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [visible, reduce]);
  useEffect(() => {
    if (!running || (!reduce && phase < 4)) return;
    const timer = setTimeout(
      () => {
        setPhase(4);
        setRunning(false);
      },
      reduce ? 0 : 700,
    );
    return () => clearTimeout(timer);
  }, [phase, running, reduce]);
  const run = () => {
    hasAutoRun.current = true;
    setRunId((value) => value + 1);
    setPhase(reduce ? 4 : 0);
    setRunning(!reduce);
  };
  // Both responsive drawings share this guarded arrival transition. No separate
  // node timer can race ahead of the actual traveling signal.
  const arrive = (next: number) =>
    setPhase((current) => (next === current + 1 ? next : current));
  return (
    <div
      className={styles.connected}
      ref={ref}
      data-testid="connected-workflow"
    >
      <aside
        className={styles.simulation}
        data-testid="live-simulation"
        data-stage={phase}
      >
        <strong>{l.title}</strong>
        <ol>
          {l.steps.map((step, index) => (
            <li
              key={step}
              className={`${index < phase ? styles.done : ""} ${index === phase ? styles.current : ""}`}
            >
              <span>{index + 1}</span>
              {step}
              <Check aria-hidden="true" />
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {l.steps[phase]}
        </p>
        <button type="button" onClick={run} disabled={running}>
          {running ? l.running : phase === 4 ? l.replay : l.run}
          <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
        </button>
      </aside>
      <div className={styles.canvas}>
        <WorkflowMap
          locale={locale}
          vertical={false}
          phase={phase}
          running={running}
          runId={runId}
          reduce={reduce}
          arrive={arrive}
        />
        <WorkflowMap
          locale={locale}
          vertical
          phase={phase}
          running={running}
          runId={runId}
          reduce={reduce}
          arrive={arrive}
        />
      </div>
    </div>
  );
}
