"use client";

import { useReducer, useRef, useState } from "react";
import { Activity, ArrowUpRight, BarChart3, CalendarDays, LayoutDashboard, Moon, RotateCcw, Users, UserRound } from "lucide-react";
import { initialState, reducer, type Action, type Branch, type Locale } from "./data";
import { labels } from "./labels";
import { BookingDetails } from "./booking-details";
import { DemoActivity, DemoAnalytics, DemoBookings, DemoCustomers, DemoOverview, DemoTeam } from "./views";
import s from "./operations-demo.module.css";
const tabs = ["overview","bookings","team","customers","activity","analytics"] as const;
const icons = [LayoutDashboard,CalendarDays,Users,UserRound,Activity,BarChart3];
export function RelaxMoonSpaDemo({ locale }: {locale: Locale}) {
  const l = labels(locale), ar = locale === "ar";
  const [state,dispatch] = useReducer(reducer,undefined,initialState), [tab,setTab] = useState<typeof tabs[number]>("overview"), [branch,setBranch] = useState<Branch | "all">("all"), [selected,setSelected] = useState<string|null>(null), [notice,setNotice] = useState("");
  const consoleRef = useRef<HTMLDivElement>(null);
  const bookings = state.bookings.filter(b => branch === "all" || b.branch === branch);
  const activity = state.activity.filter(e => bookings.some(b => b.id === e.bookingId));
  const props = { bookings,locale,open:setSelected };
  const booking = state.bookings.find(b => b.id === selected);
  function mutate(action: Action) { dispatch(action); setNotice(action.type === "reset" ? l.restored : action.type === "status" ? l.updated : l.assigned); }
  function reset() { mutate({type:"reset"}); setBranch("all");setTab("overview");setSelected(null); }
  return <section className={s.section} id="operations-demo" dir={ar ? "rtl" : "ltr"} aria-labelledby="operations-title"><div className="shell">
    <div className={s.intro}><div><span className="eyebrow">{ar ? "عرض النظام التفاعلي" : "LIVE PRODUCT DEMO"}</span><h2 id="operations-title">{ar ? "جرّب إدارة العمليات." : "Experience the\noperations console."}</h2><p>{ar ? "استكشف بيئة ريلاكس مون سبا التجريبية. راجع الحجوزات وعيّن الأخصائيين وتابع النشاط عبر فرعين." : "Step inside a simulated Relax Moon Spa environment. Review bookings, assign specialists and follow operations across two branches."}</p></div><div className={s.launch}><button className="button button-primary" onClick={() => {consoleRef.current?.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});consoleRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus({preventScroll:true});}}>{ar ? "ابدأ التجربة التفاعلية" : "Launch interactive demo"}<ArrowUpRight size={18}/></button><small>{ar ? "بيئة محاكاة · بلا بيانات عملاء حقيقية" : "SIMULATED ENVIRONMENT / NO LIVE CUSTOMER DATA"}</small></div></div>
    <div ref={consoleRef} className={s.console} data-testid="operations-console"><header className={s.topbar}><div className={s.brand}><span className={s.moon}><Moon size={22}/></span><div><strong>RELAX MOON SPA</strong><small>{ar ? "لوحة العمليات" : "OPERATIONS CONSOLE"}</small></div></div><span className={s.demo}><i/>{l.demo}</span><label className={s.branch}>{l.branch}<select aria-label={l.branch} value={branch} onChange={e => {setBranch(e.target.value as Branch | "all");setSelected(null);}}><option value="all">{l.all}</option><option value="riyadh">{l.riyadh}</option><option value="shq">{l.shq}</option></select></label><button className={s.reset} onClick={reset}><RotateCcw size={15}/>{l.reset}</button></header>
      <div className={s.body}><nav className={s.sidebar} aria-label={ar ? "أقسام العمليات" : "Operations sections"}><div role="tablist" aria-label={ar ? "لوحة العمليات" : "Operations console"} className={s.tabs}>{tabs.map((name,index) => {const Icon = icons[index];return <button key={name} role="tab" id={`operations-tab-${name}`} aria-controls={`operations-panel-${tab}`} aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)} onKeyDown={e => { const delta = e.key === "ArrowDown" || e.key === (ar ? "ArrowLeft" : "ArrowRight") ? 1 : e.key === "ArrowUp" || e.key === (ar ? "ArrowRight" : "ArrowLeft") ? -1 : 0; if(delta || e.key === "Home" || e.key === "End") {e.preventDefault();const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length-1 : (index+delta+tabs.length)%tabs.length;setTab(tabs[next]);document.getElementById(`operations-tab-${tabs[next]}`)?.focus();}}}><Icon size={17}/>{l[name]}<span aria-hidden="true">{String(index+1).padStart(2,"0")}</span></button>;})}</div><div className={s.sidebarFoot}><span>ELSHEIK</span><small>DIGITAL SOLUTIONS</small><p>{ar ? "عمليات مترابطة.\nتحكم موحد." : "Connected operations.\nOne shared state."}</p></div></nav>
      <div role="tabpanel" id={`operations-panel-${tab}`} aria-labelledby={`operations-tab-${tab}`} tabIndex={0} className={s.content}><div className={s.contentHeading}><div><span className={s.meta}>{ar ? "مركز التحكم" : "WORKSPACE / OPERATIONS"}</span><h3>{l[tab]}</h3></div><span className={s.clock}>{l.snapshot}</span></div><div role="status" className={s.notice}>{notice}</div>
        {tab === "overview" && <DemoOverview {...props} activity={activity} viewBookings={() => setTab("bookings")}/>}
        {tab === "bookings" && <DemoBookings {...props}/>}{tab === "team" && <DemoTeam {...props}/>}{tab === "customers" && <DemoCustomers {...props}/>}{tab === "activity" && <DemoActivity {...props} activity={activity}/>}{tab === "analytics" && <DemoAnalytics {...props}/>}
      </div></div><footer className={s.consoleFooter}><span>{ar ? "حجوزات ← تعيينات ← أحداث" : "BOOKINGS → ASSIGNMENTS → EVENTS"}</span><span>{ar ? "محاكاة محلية فقط" : "LOCAL SIMULATION ONLY"}</span></footer>
    </div>{booking && <BookingDetails booking={booking} state={state} records={bookings} locale={locale} close={() => setSelected(null)} open={setSelected} dispatch={mutate}/>}
  </div></section>;
}
