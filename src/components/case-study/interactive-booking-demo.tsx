"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RefreshCw, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import styles from "./interactive-booking-demo.module.css";

type State =
  | "idle" | "intent" | "service" | "date" | "time" | "locationType" | "location" | "specialist"
  | "bookingProcessing" | "bookingConfirmed" | "rescheduleLookup" | "rescheduleDate" | "rescheduleTime"
  | "rescheduleProcessing" | "rescheduleConfirmed" | "cancelLookup" | "cancelPolicy" | "cancelProcessing"
  | "cancelConfirmed" | "cancelDenied";
type Message = { id: number; role: "customer" | "bot"; text: string };
type Booking = { service?: string; date?: string; time?: string; locationType?: string; location?: string; specialist?: string };

const copy = {
  en: {
    demo: "INTERACTIVE DEMO", title: "Try the booking assistant", system: "Relax Moon Spa / Booking Assistant",
    note: "This simulation uses fictional data and does not create a real booking.", placeholder: 'Type "Hi" or start the conversation…', send: "Send message",
    welcome: "Welcome to Relax Moon Spa. Your comfort starts here. We provide professional massage sessions at home or your hotel. How can we help today?",
    fallback: "Welcome to the Relax Moon Spa demo. Choose an option below.", actions: ["Book an appointment", "Change my appointment", "Cancel my booking"],
    service: "Choose a service.", services: ["Thai massage", "Swedish massage", "Shiatsu massage"], date: "Choose a date.", dates: ["Today", "Tomorrow", "Choose demo date"],
    time: "Choose a simulated time. These are demo slots only.", times: ["5:00 PM", "7:00 PM", "9:00 PM", "11:00 PM"],
    locationType: "Where would you prefer the session?", locationTypes: ["Home", "Hotel"], location: "No precise location is requested. Continue with a fictional location.", demoLocation: "Use demo location",
    specialist: "Do you have a specialist preference?", specialists: ["Filipino", "Indonesian", "No preference"], checking: "Checking simulated availability…",
    confirmed: "Your demo booking is confirmed.", current: "Current appointment: Tomorrow — 7:00 PM.", useBooking: "Use Demo Booking", newDate: "Choose a new date.", newTime: "Choose a new time.",
    rescheduled: "Your demo appointment was changed successfully.", cancelPolicy: "Choose a cancellation policy scenario.", approvedScenario: "More than one hour away", deniedScenario: "Less than one hour away",
    cancelled: "The demo booking was cancelled. Calendar and booking record updated.", denied: "This booking cannot be cancelled because less than one hour remains. Please contact customer service for assistance.",
    complete: "BOOKING JOURNEY COMPLETE", restart: "Restart demo", architecture: "Explore the architecture", project: "Start a project",
    progress: ["Greeting", "Intent", "Service", "Date", "Time", "Location", "Availability", "Assignment", "Confirmation"],
    systemTitle: "SYSTEM EXECUTION", systemNote: "LOCAL FRONTEND STATE / NO EXTERNAL CALLS", pending: "PENDING", active: "ACTIVE", completeStatus: "COMPLETE",
    stages: ["Customer Request", "WhatsApp Interface", "Message Parsed", "Booking Data Collected", "Availability Check", "Specialist Assignment", "Calendar Check", "Booking Record Prepared", "Confirmation Generated"],
    calendar: "CALENDAR SIMULATION", requested: "Requested", calendarStatus: "Calendar", slot: "Slot available", specialistFound: "Available specialist found",
  },
  ar: {
    demo: "عرض تفاعلي", title: "جرّب مساعد الحجز", system: "ريلاكس مون سبا / مساعد الحجز",
    note: "تستخدم هذه المحاكاة بيانات خيالية ولا تنشئ حجزًا حقيقيًا.", placeholder: "اكتب سلام أو ابدأ المحادثة…", send: "إرسال الرسالة",
    welcome: "حيّاك الله في ريلاكس مون سبا. راحتك تبدأ من عندنا. نوفر جلسات مساج احترافية في المنزل أو الفندق. وش نقدر نخدمك فيه اليوم؟",
    fallback: "مرحبًا بك في عرض ريلاكس مون سبا. اختر أحد الخيارات أدناه.", actions: ["أبي أحجز موعد", "أبغى أغير موعدي", "أبغى ألغي الحجز"],
    service: "اختر نوع الخدمة.", services: ["مساج تايلندي", "مساج سويدي", "مساج شياتسو"], date: "اختر التاريخ.", dates: ["اليوم", "غدًا", "اختيار تاريخ تجريبي"],
    time: "اختر وقتًا تجريبيًا. هذه المواعيد للمحاكاة فقط.", times: ["5:00 مساءً", "7:00 مساءً", "9:00 مساءً", "11:00 مساءً"],
    locationType: "وين تفضّل تكون الجلسة؟", locationTypes: ["المنزل", "الفندق"], location: "لن نطلب موقعك الفعلي. تابع باستخدام موقع خيالي.", demoLocation: "استخدم الموقع التجريبي",
    specialist: "هل لديك تفضيل لجنسية الأخصائي؟", specialists: ["فلبيني", "إندونيسي", "بدون تفضيل"], checking: "جاري التحقق من التوفر التجريبي…",
    confirmed: "تم تأكيد حجزك التجريبي بنجاح.", current: "الموعد الحالي: غدًا — 7:00 مساءً.", useBooking: "استخدم الحجز التجريبي", newDate: "اختر تاريخًا جديدًا.", newTime: "اختر وقتًا جديدًا.",
    rescheduled: "تم تغيير الموعد التجريبي بنجاح.", cancelPolicy: "اختر سيناريو سياسة الإلغاء.", approvedScenario: "متبقي أكثر من ساعة", deniedScenario: "متبقي أقل من ساعة",
    cancelled: "تم إلغاء الحجز التجريبي وتحديث التقويم والسجل.", denied: "عذرًا، لا يمكن إلغاء الحجز لأن المتبقي على الموعد أقل من ساعة. يرجى التواصل مع خدمة العملاء للمساعدة.",
    complete: "اكتملت رحلة الحجز", restart: "إعادة العرض", architecture: "استكشف البنية", project: "ابدأ مشروعًا",
    progress: ["الترحيب", "الطلب", "الخدمة", "التاريخ", "الوقت", "الموقع", "التوفر", "التعيين", "التأكيد"],
    systemTitle: "تنفيذ النظام", systemNote: "حالة محلية فقط / بلا اتصالات خارجية", pending: "قيد الانتظار", active: "نشط", completeStatus: "مكتمل",
    stages: ["طلب العميل", "واجهة واتساب", "تحليل الرسالة", "جمع بيانات الحجز", "فحص التوفر", "تعيين الأخصائي", "فحص التقويم", "إعداد سجل الحجز", "إنشاء التأكيد"],
    calendar: "محاكاة التقويم", requested: "المطلوب", calendarStatus: "التقويم", slot: "الموعد متاح", specialistFound: "تم العثور على أخصائي متاح",
  },
} as const;

const greetings = /^(hi|hello|hey|salam|سلام|السلام عليكم|هلا|اهلين|أهلين|مرحبا|في حجز|شغالين الليلة|كيفك)/i;

export function InteractiveBookingDemo({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [state, setState] = useState<State>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [booking, setBooking] = useState<Booking>({});
  const [input, setInput] = useState("");
  const [stage, setStage] = useState(-1);
  const [typing, setTyping] = useState(false);
  const id = useRef(0);
  const chat = useRef<HTMLDivElement>(null);
  const add = (role: Message["role"], text: string) => setMessages((m) => [...m, { id: id.current++, role, text }]);
  const prompt = (text: string, next: State, delay = 280) => { setTyping(true); window.setTimeout(() => { add("bot", text); setTyping(false); setState(next); }, delay); };
  const reset = () => { setState("idle"); setMessages([]); setBooking({}); setInput(""); setStage(-1); setTyping(false); };

  useEffect(() => { chat.current?.scrollTo({ top: chat.current.scrollHeight, behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => {
    if (!state.endsWith("Processing")) return;
    const timers = [4, 5, 6, 7, 8].map((value, index) => window.setTimeout(() => setStage(value), 550 * (index + 1)));
    const done = window.setTimeout(() => {
      const next = state === "bookingProcessing" ? "bookingConfirmed" : state === "rescheduleProcessing" ? "rescheduleConfirmed" : "cancelConfirmed";
      const text = state === "bookingProcessing" ? `${c.confirmed}\n${booking.service} · ${booking.date} · ${booking.time}\n${booking.locationType} · Riyadh — Demo Location` : state === "rescheduleProcessing" ? c.rescheduled : c.cancelled;
      add("bot", text); setStage(9); setState(next); setTyping(false);
    }, 3300);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [state, booking.date, booking.locationType, booking.service, booking.time, c.cancelled, c.confirmed, c.rescheduled]);

  const startIntent = (value: string) => {
    add("customer", value);
    const index = c.actions.indexOf(value as never);
    if (index === 0) { setStage(2); prompt(c.service, "service"); }
    else if (index === 1) { setStage(2); prompt(c.current, "rescheduleLookup"); }
    else { setStage(2); prompt(c.current, "cancelLookup"); }
  };
  const choose = (value: string) => {
    add("customer", value);
    if (state === "service") { setBooking((b) => ({ ...b, service: value })); setStage(3); prompt(c.date, "date"); }
    else if (state === "date") { setBooking((b) => ({ ...b, date: value })); setStage(4); prompt(c.time, "time"); }
    else if (state === "time") { setBooking((b) => ({ ...b, time: value })); setStage(5); prompt(c.locationType, "locationType"); }
    else if (state === "locationType") { setBooking((b) => ({ ...b, locationType: value })); prompt(c.location, "location"); }
    else if (state === "location") { setBooking((b) => ({ ...b, location: "Riyadh — Demo Location" })); prompt(c.specialist, "specialist"); }
    else if (state === "specialist") { setBooking((b) => ({ ...b, specialist: value })); add("bot", c.checking); setTyping(true); setStage(3); setState("bookingProcessing"); }
    else if (state === "rescheduleLookup") prompt(c.newDate, "rescheduleDate");
    else if (state === "rescheduleDate") { setBooking((b) => ({ ...b, date: value })); prompt(c.newTime, "rescheduleTime"); }
    else if (state === "rescheduleTime") { setBooking((b) => ({ ...b, time: value })); add("bot", c.checking); setTyping(true); setStage(3); setState("rescheduleProcessing"); }
    else if (state === "cancelLookup") prompt(c.cancelPolicy, "cancelPolicy");
    else if (state === "cancelPolicy" && value === c.approvedScenario) { add("bot", c.checking); setTyping(true); setStage(3); setState("cancelProcessing"); }
    else if (state === "cancelPolicy") { add("bot", c.denied); setState("cancelDenied"); setStage(4); }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); const value = input.trim(); if (!value) return; add("customer", value); setInput(""); setStage(1); prompt(greetings.test(value) ? c.welcome : c.fallback, "intent"); };
  const options = useMemo(() => {
    if (state === "intent") return [...c.actions]; if (state === "service") return [...c.services]; if (state === "date" || state === "rescheduleDate") return [...c.dates];
    if (state === "time" || state === "rescheduleTime") return [...c.times]; if (state === "locationType") return [...c.locationTypes]; if (state === "location") return [c.demoLocation];
    if (state === "specialist") return [...c.specialists]; if (state === "rescheduleLookup" || state === "cancelLookup") return [c.useBooking]; if (state === "cancelPolicy") return [c.approvedScenario, c.deniedScenario]; return [];
  }, [state, c]);
  const finished = state.endsWith("Confirmed") || state === "cancelDenied";

  return <section className={styles.experience} data-testid="booking-demo" data-state={state} aria-labelledby="demo-title">
    <div className="shell">
      <header className={styles.intro}><div><span className="eyebrow">{c.demo}</span><h2 id="demo-title">{c.title}</h2></div><p>{c.note}</p></header>
      <ol className={styles.progress} aria-label={locale === "ar" ? "تقدم الرحلة" : "Journey progress"}>{c.progress.map((label, index) => <li className={index <= stage ? styles.progressActive : ""} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
      <div className={styles.dual}>
        <div className={styles.customer}><div className={styles.perspective}>{locale === "ar" ? "ما يختبره العميل" : "WHAT THE CUSTOMER EXPERIENCES"}</div><div className={styles.phone} aria-label={c.title}>
          <header><div className={styles.avatar}>RM</div><div><strong>{c.system}</strong><small>{c.demo}</small></div><i /></header>
          <div className={styles.chat} ref={chat} aria-live="polite" aria-busy={typing}>{messages.length === 0 && <div className={styles.invitation}><b>{c.title}</b><span>{c.placeholder}</span></div>}{messages.map((message) => <div className={message.role === "customer" ? styles.customerMessage : styles.botMessage} key={message.id}>{message.text.split("\n").map((line) => <span key={line}>{line}</span>)}</div>)}{typing && <div className={styles.typing} aria-label={locale === "ar" ? "جارٍ الرد" : "Assistant typing"}><i/><i/><i/></div>}</div>
          {options.length > 0 && <div className={styles.replies}>{options.map((option) => <button key={option} onClick={() => state === "intent" ? startIntent(option) : choose(option)} type="button">{option}</button>)}</div>}
          {finished && <div className={styles.complete}><strong>{c.complete}</strong><div><button type="button" onClick={reset}><RefreshCw />{c.restart}</button><a href="#architecture"><ArrowRight />{c.architecture}</a><Link href={`/${locale}/contact`}>{c.project}</Link></div></div>}
          <form className={styles.composer} onSubmit={submit}><input aria-label={c.placeholder} disabled={state !== "idle"} value={input} onChange={(e) => setInput(e.target.value)} placeholder={c.placeholder}/><button type="submit" disabled={state !== "idle" || !input.trim()} aria-label={c.send}><Send /></button></form>
        </div></div>
        <aside className={styles.system} data-testid="system-execution" aria-label={c.systemTitle}><div className={styles.perspective}>{locale === "ar" ? "ما يفعله النظام" : "WHAT THE SYSTEM DOES"}</div><header><span>{c.systemTitle}</span><small>{c.systemNote}</small></header><ol>{c.stages.map((label, index) => { const status = index < stage ? c.completeStatus : index === stage ? c.active : c.pending; return <li className={index <= stage ? styles.stageOn : ""} key={label}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{label}</strong><small>{status}</small></div>{index < stage && <Check />}</li>;})}</ol><div className={styles.runtime}><span>{c.calendar}</span><p><small>{c.requested}</small><b>{booking.date || "—"} / {booking.time || "—"}</b></p><p><small>{c.calendarStatus}</small><b>{stage >= 6 ? c.slot : stage >= 4 ? c.checking : "—"}</b></p><p><small>{locale === "ar" ? "الأخصائي" : "Specialist"}</small><b>{stage >= 5 ? c.specialistFound : "—"}</b></p></div></aside>
      </div>
    </div>
  </section>;
}
