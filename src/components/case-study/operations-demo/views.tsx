import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { active, branches, customerName, customers, inService, NOW, services, specialists, statuses, time, TODAY, type Activity, type Booking, type Locale, type Status } from "./data";
import { labels } from "./labels";
import s from "./operations-demo.module.css";
export type ViewProps = { bookings: Booking[]; locale: Locale; open: (id: string) => void };
export function StatusBadge({ status, locale }: { status: Status; locale: Locale }) {
  return <span className={s.badge} data-status={status}><i />{labels(locale)[status]}</span>;
}
export function BookingList({ bookings, locale, open }: ViewProps) {
  const l = labels(locale);
  return bookings.length ? <div className={s.table} role="table" aria-label={l.bookings}>
    <div className={s.tableHead} role="row">{[l.customer, l.service, l.time, l.specialist, l.status].map(x => <span role="columnheader" key={x}>{x}</span>)}</div>
    {bookings.map(b => <div className={s.row} role="row" key={b.id}>
      <div role="cell"><button className={s.record} onClick={() => open(b.id)}><strong>{customerName(b, locale)}</strong><bdi>{b.id}</bdi></button></div>
      <div role="cell">{services[b.service][locale]}<small>{branches[b.branch][locale]} · {b.price} {l.currency}</small></div>
      <div role="cell"><bdi>{time(b.minute)}</bdi><small><bdi>{b.date}</bdi></small></div>
      <div role="cell">{specialists.find(x => x.id === b.specialistId)?.name[locale] || l.unassigned}</div>
      <div role="cell"><StatusBadge status={b.status} locale={locale} /></div>
    </div>)}
  </div> : <p className={s.empty}>{l.empty}</p>;
}
export function DemoBookings(props: ViewProps) {
  const l = labels(props.locale), [query, setQuery] = useState(""), [status, setStatus] = useState("all"), [sort, setSort] = useState("asc");
  const records = props.bookings.filter(b => (status === "all" || b.status === status) && `${b.id} ${customerName(b, props.locale)} ${services[b.service][props.locale]}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a,b) => (a.date.localeCompare(b.date) || a.minute - b.minute) * (sort === "asc" ? 1 : -1));
  return <><div className={s.filters}><label className={s.search}><Search size={16} /><input aria-label={l.search} placeholder={l.search} value={query} onChange={e => setQuery(e.target.value)} /></label><label>{l.status}<select value={status} onChange={e => setStatus(e.target.value)}>{["all", ...statuses].map(x => <option value={x} key={x}>{x === "all" ? l.allStatuses : l[x as Status]}</option>)}</select></label><label>{l.time}<select value={sort} onChange={e => setSort(e.target.value)}><option value="asc">{props.locale === "ar" ? "الأقدم أولاً" : "Earliest first"}</option><option value="desc">{props.locale === "ar" ? "الأحدث أولاً" : "Latest first"}</option></select></label></div><p className={s.meta} data-testid="booking-count">{records.length} {l.results}</p><BookingList {...props} bookings={records} /></>;
}
export function DemoOverview(props: ViewProps & { viewBookings: () => void; activity: Activity[] }) {
  const l = labels(props.locale), today = props.bookings.filter(b => b.date === TODAY);
  const metrics = [[l.today, today.length], [l.upcoming, props.bookings.filter(b => active(b) && (b.date > TODAY || b.date === TODAY && b.minute >= NOW)).length], [l.completed, today.filter(b => b.status === "completed").length], [l.cancelled, today.filter(b => b.status === "cancelled").length], [l.activeTeam, new Set(props.bookings.filter(b => active(b) && b.specialistId).map(b => b.specialistId)).size], [l.assignments, props.bookings.filter(b => active(b) && !b.specialistId).length]];
  return <><div className={s.metrics}>{metrics.map(([name, value], i) => <div key={name} className={s.metric}><span>{name}</span><strong data-testid={`metric-${i}`}>{String(value).padStart(2,"0")}</strong><small>{i === 5 ? (props.locale === "ar" ? "تحتاج إلى مراجعة" : "Needs attention") : l.demo}</small></div>)}</div><div className={s.sectionTitle}><h4>{l.schedule}</h4><button onClick={props.viewBookings}>{l.viewAll}<ArrowUpRight size={15}/></button></div><BookingList {...props} bookings={today.filter(active).slice(0,4)} /><div className={s.sectionTitle}><h4>{l.activity}</h4><span className={s.meta}>{props.locale === "ar" ? "حالة تشغيل مشتركة" : "ONE CONNECTED WORKFLOW"}</span></div><EventList {...props} activity={props.activity.slice(0,3)} /></>;
}
export function DemoTeam(props: ViewProps) {
  const l = labels(props.locale), [available, setAvailable] = useState(false), [selected, setSelected] = useState<string | null>(null);
  const branchIds = new Set(props.bookings.map(b => b.branch));
  return <><p className={s.note}>{l.teamNote}</p><label className={s.check}><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />{l.availableOnly}</label><div className={s.cards}>{specialists.filter(x => branchIds.has(x.branch) && (!available || !inService(x.id, props.bookings))).map(x => {
    const schedule = props.bookings.filter(b => b.specialistId === x.id).sort((a,b) => a.date.localeCompare(b.date) || a.minute - b.minute);
    const next = schedule.find(b => active(b) && (b.date > TODAY || b.minute >= NOW));
    return <article className={s.card} key={x.id}><div className={s.sectionTitle}><span className={s.avatar}>{x.name[props.locale].slice(0,1)}</span><span className={s.meta}>{inService(x.id,props.bookings) ? l.inService : l.available}</span></div><h4>{x.name[props.locale]}</h4><p>{x.nationality[props.locale]} · {branches[x.branch][props.locale]}</p><strong>{schedule.filter(b => b.date === TODAY && b.status !== "cancelled").length} {l.today}</strong><p>{l.next}: {next ? <bdi>{next.date} / {time(next.minute)}</bdi> : l.noNext}</p><button aria-expanded={selected === x.id} onClick={() => setSelected(selected === x.id ? null : x.id)}>{l.inspect}<ArrowUpRight size={16}/></button>{selected === x.id && <div className={s.schedule}>{schedule.length ? schedule.map(b => <button key={b.id} onClick={() => props.open(b.id)}><bdi>{b.date} / {time(b.minute)}</bdi><span>{customerName(b,props.locale)}</span><StatusBadge status={b.status} locale={props.locale}/></button>) : <p>{l.noNext}</p>}</div>}</article>;
  })}</div><div className={s.sectionTitle}><h4>{l.assignments}</h4></div><BookingList {...props} bookings={props.bookings.filter(b => active(b) && !b.specialistId)} /></>;
}
export function DemoCustomers(props: ViewProps) {
  const l = labels(props.locale), [selected, setSelected] = useState<string | null>(null);
  return <div className={s.cards}>{customers.filter(c => props.bookings.some(b => b.customerId === c.id)).map(c => {
    const history = props.bookings.filter(b => b.customerId === c.id).sort((a,b) => b.date.localeCompare(a.date) || b.minute - a.minute);
    const past = history.filter(b => b.date < TODAY || b.date === TODAY && b.minute <= NOW);
    const preferred = services.map((_,i) => ({ i, count: history.filter(b => b.service === i).length })).sort((a,b) => b.count - a.count)[0].i;
    return <article className={s.card} key={c.id}><span className={s.meta}><bdi>{c.id}</bdi> · {l.demo}</span><h4>{c.name[props.locale]}</h4><p>{[...new Set(history.map(b => branches[b.branch][props.locale]))].join(" / ")}</p><strong>{history.length} {l.bookings}</strong><p>{l.last}: <bdi>{past[0]?.date || "—"}</bdi></p><p>{l.preferred}: {services[preferred][props.locale]}</p><button aria-expanded={selected === c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}>{l.history}<ArrowUpRight size={16}/></button>{selected === c.id && <div className={s.schedule}><p>{l.notes}</p>{history.map(b => <button key={b.id} onClick={() => props.open(b.id)}><bdi>{b.id}</bdi><StatusBadge status={b.status} locale={props.locale}/></button>)}</div>}</article>;
  })}</div>;
}
export function EventList({ activity, locale, open, bookings }: ViewProps & { activity: Activity[] }) {
  return <div className={s.events}>{activity.length ? activity.map(e => <button className={s.event} key={e.id} onClick={() => open(e.bookingId)}><bdi>{e.time}</bdi><span><bdi className={s.eventType}>{e.type}</bdi><small>{e.detail[locale]}</small></span><span><bdi>{e.bookingId}</bdi><small>{bookings.find(b => b.id === e.bookingId) && customerName(bookings.find(b => b.id === e.bookingId)!,locale)}</small></span><ArrowUpRight size={16}/></button>) : <p className={s.empty}>{labels(locale).empty}</p>}</div>;
}
export function DemoActivity(props: ViewProps & { activity: Activity[] }) {
  const l = labels(props.locale), [query,setQuery] = useState(""), [category,setCategory] = useState("all");
  const activity = props.activity.filter(e => (category === "all" || e.category === category) && `${e.bookingId} ${e.type} ${customerName(props.bookings.find(b => b.id === e.bookingId)!,props.locale)} ${e.detail[props.locale]}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <><div className={s.filters}><label className={s.search}><Search size={16}/><input aria-label={l.eventSearch} placeholder={l.eventSearch} value={query} onChange={e => setQuery(e.target.value)} /></label><label>{l.eventFilter}<select value={category} onChange={e => setCategory(e.target.value)}>{[["all",l.allEvents],["bookings",l.bookings],["assignments",l.assign],["customer",l.customerActions],["system",l.system]].map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label></div><EventList {...props} activity={activity}/></>;
}
function Bars({ title, values }: { title: string; values: [string,number][] }) {
  const max = Math.max(1,...values.map(x => x[1]));
  return <article className={s.card}><h4>{title}</h4><div className={s.bars}>{values.map(([label,value]) => <div key={label}><div><span>{label}</span><b>{value}</b></div><div className={s.track}><span style={{width:`${value/max*100}%`}} /></div></div>)}</div></article>;
}
export function DemoAnalytics({bookings,locale}: ViewProps) {
  const l = labels(locale);
  return <><p className={s.note}>{l.analyticsNote}</p><div className={s.charts}><Bars title={l.byStatus} values={statuses.map(x => [l[x],bookings.filter(b => b.status === x).length])}/><Bars title={l.byBranch} values={Object.entries(branches).map(([id,name]) => [name[locale],bookings.filter(b => b.branch === id).length])}/><Bars title={l.distribution} values={services.map((x,i) => [x[locale],bookings.filter(b => b.service === i).length])}/><Bars title={l.peak} values={[12,15,18,21].map(hour => [`${time(hour*60)}–${time((hour+3)*60)}`,bookings.filter(b => b.minute >= hour*60 && b.minute < (hour+3)*60).length])}/><Bars title={l.utilization} values={specialists.filter(x => bookings.some(b => b.branch === x.branch)).map(x => [x.name[locale],bookings.filter(b => b.specialistId === x.id && b.status !== "cancelled").reduce((n,b) => n+b.duration/60,0)])}/></div></>;
}
