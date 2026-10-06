import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { active, availableFor, branches, customerName, services, specialists, time, type Action, type Booking, type DemoState, type Locale } from "./data";
import { labels } from "./labels";
import { EventList, StatusBadge } from "./views";
import s from "./operations-demo.module.css";
export function BookingDetails({ booking, state, records, locale, close, open, dispatch }: { booking: Booking; state: DemoState; records: Booking[]; locale: Locale; close: () => void; open: (id:string) => void; dispatch: (action:Action) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), [choice,setChoice] = useState("");
  const l = labels(locale);
  useEffect(() => {
    const element = dialog.current!, previous = document.activeElement as HTMLElement | null;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus({preventScroll:true}); };
  }, []);
  const options = specialists.filter(x => availableFor(x.id,booking,state.bookings) && x.id !== booking.specialistId);
  const index = records.findIndex(b => b.id === booking.id);
  return <dialog ref={dialog} className={s.dialog} dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="operations-booking-title" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div className={s.dialogInner}><header className={s.sectionTitle}><span className={s.meta}>{l.demo} / {l.details}</span><button aria-label={l.close} onClick={close} autoFocus><X size={20}/></button></header>
      <h3 id="operations-booking-title">{customerName(booking,locale)}</h3><p className={s.meta}><bdi>{booking.id}</bdi></p><StatusBadge status={booking.status} locale={locale}/>
      <dl className={s.facts}>{[[l.service,services[booking.service][locale]],[l.branch,branches[booking.branch][locale]],[l.date,booking.date],[l.time,time(booking.minute)],[l.duration,`${booking.duration} ${l.minutes}`],[l.price,`${booking.price} ${l.currency}`],[l.specialist,specialists.find(x => x.id === booking.specialistId)?.name[locale] || l.unassigned],[l.source,"WhatsApp → n8n / DEMO"]].map(([key,value]) => <div key={key}><dt>{key}</dt><dd><bdi>{value}</bdi></dd></div>)}</dl>
      {active(booking) && <><h4>{l.update}</h4><div className={s.actions}>{booking.status === "pending" ? <button onClick={() => dispatch({type:"status",id:booking.id,status:"confirmed"})}>{l.confirm}</button> : <button onClick={() => dispatch({type:"status",id:booking.id,status:"completed"})}>{l.complete}</button>}<button onClick={() => dispatch({type:"status",id:booking.id,status:"cancelled"})}>{l.cancel}</button></div>
      <h4>{l.assign}</h4><label className={s.assign}>{l.choose}<select value={choice} onChange={e => setChoice(e.target.value)}><option value="">{options.length ? l.choose : l.noSpecialist}</option>{options.map(x => <option key={x.id} value={x.id}>{x.name[locale]}</option>)}</select></label><button className={s.primary} disabled={!options.some(x => x.id === choice)} onClick={() => { dispatch({type:"assign",id:booking.id,specialistId:choice}); setChoice(""); }}>{l.confirmAssignment}</button></>}
      <h4>{l.timeline}</h4><EventList bookings={state.bookings} activity={state.activity.filter(e => e.bookingId === booking.id)} locale={locale} open={open}/>
      <div className={s.pager}><button disabled={index <= 0} onClick={() => {setChoice("");open(records[index-1].id);}}>{l.previous}</button><button disabled={index < 0 || index >= records.length-1} onClick={() => {setChoice("");open(records[index+1].id);}}>{l.nextRecord}</button></div>
    </div>
  </dialog>;
}
