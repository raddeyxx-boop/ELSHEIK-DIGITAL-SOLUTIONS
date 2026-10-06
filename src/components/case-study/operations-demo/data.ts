// COMMERCIAL DEMO DATA ONLY.
// DO NOT REPLACE WITH PRODUCTION CUSTOMER DATA.
export type Locale = "en" | "ar";
export type Branch = "riyadh" | "shq";
export type Status = "pending" | "confirmed" | "completed" | "cancelled";
export type Localized = { en: string; ar: string };
export const TODAY = "2026-09-16";
export const NOW = 18 * 60;
export const statuses: Status[] = ["pending", "confirmed", "completed", "cancelled"];
export const branches: Record<Branch, Localized> = { riyadh: { en: "Riyadh", ar: "الرياض" }, shq: { en: "Al Sharqiyah", ar: "الشرقية" } };
export const services: Localized[] = [{ en: "Swedish massage", ar: "مساج سويدي" }, { en: "Deep tissue", ar: "مساج الأنسجة العميقة" }, { en: "Thai massage", ar: "مساج تايلندي" }];
export const customers = [
  ["Omar Nadir", "عمر نادر"], ["Sara Rami", "سارة رامي"], ["Adam Sami", "آدم سامي"], ["Laila Nabil", "ليلى نبيل"],
  ["Rana Adel", "رنا عادل"], ["Yusuf Hani", "يوسف هاني"], ["Nora Salim", "نورا سليم"], ["Tariq Zaid", "طارق زيد"],
].map(([en, ar], i) => ({ id: `DEMO-C${i + 1}`, name: { en, ar } }));
export const specialists = [
  { id: "s1", name: { en: "Maya Santos", ar: "مايا سانتوس" }, branch: "riyadh" as Branch, nationality: { en: "Filipino", ar: "فلبينية" } },
  { id: "s2", name: { en: "Dina Putri", ar: "دينا بوتري" }, branch: "riyadh" as Branch, nationality: { en: "Indonesian", ar: "إندونيسية" } },
  { id: "s3", name: { en: "Lina Cruz", ar: "لينا كروز" }, branch: "riyadh" as Branch, nationality: { en: "Filipino", ar: "فلبينية" } },
  { id: "s4", name: { en: "Mira Dewi", ar: "ميرا ديوي" }, branch: "shq" as Branch, nationality: { en: "Indonesian", ar: "إندونيسية" } },
  { id: "s5", name: { en: "Alina Reyes", ar: "ألينا رييس" }, branch: "shq" as Branch, nationality: { en: "Filipino", ar: "فلبينية" } },
  { id: "s6", name: { en: "Sinta Ayu", ar: "سينتا أيو" }, branch: "shq" as Branch, nationality: { en: "Indonesian", ar: "إندونيسية" } },
];
export type Booking = { id: string; customerId: string; branch: Branch; service: number; date: string; minute: number; duration: number; price: number; specialistId: string | null; status: Status };
export type Category = "bookings" | "assignments" | "customer" | "system";
export type Activity = { id: string; bookingId: string; type: string; category: Category; time: string; detail: Localized };
export type DemoState = { bookings: Booking[]; activity: Activity[] };
export function initialState(): DemoState {
  const bookings: Booking[] = Array.from({ length: 20 }, (_, i) => ({
    id: `DEMO-RM-${String(i + 1).padStart(3, "0")}`, customerId: customers[i % 8].id,
    branch: i % 2 ? "shq" : "riyadh", service: i % 3, date: i < 16 ? TODAY : "2026-09-17",
    minute: i < 8 ? 12 * 60 + Math.floor(i / 2) * 90 : 18 * 60 + Math.floor((i % 8) / 2) * 90,
    duration: i % 3 === 1 ? 90 : 60, price: [250, 300, 220][i % 3],
    specialistId: i % 4 === 0 ? null : `s${i % 2 ? 4 + i % 3 : 1 + i % 3}`,
    status: i < 6 ? "completed" : i < 8 ? "cancelled" : i % 4 === 0 ? "pending" : "confirmed",
  }));
  const activity: Activity[] = bookings.flatMap((b, i) => [
    { id: `created-${i}`, bookingId: b.id, type: "BOOKING_CREATED", category: "bookings" as Category, time: "17:00", detail: { en: "WhatsApp booking simulation", ar: "محاكاة حجز عبر واتساب" } },
    ...(b.specialistId ? [{ id: `assigned-${i}`, bookingId: b.id, type: "SPECIALIST_ASSIGNED", category: "assignments" as Category, time: "17:01", detail: specialists.find(s => s.id === b.specialistId)!.name }] : []),
    ...(b.status === "confirmed" ? [{ id: `confirmed-${i}`, bookingId: b.id, type: "CUSTOMER_CONFIRMED", category: "customer" as Category, time: "17:02", detail: { en: "Simulated customer confirmation", ar: "تأكيد عميل تجريبي" } }] : []),
  ]);
  activity.push({ id: "system-1", bookingId: bookings[0].id, type: "DEMO_READY", category: "system", time: "18:00", detail: { en: "Local operations environment initialized", ar: "تهيئة بيئة العمليات المحلية" } });
  return { bookings, activity: activity.reverse() };
}
export const customerName = (b: Booking, locale: Locale) => customers.find(c => c.id === b.customerId)!.name[locale];
export const time = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export const active = (b: Booking) => b.status === "pending" || b.status === "confirmed";
export function availableFor(specialistId: string, booking: Booking, bookings: Booking[]) {
  return specialists.find(s => s.id === specialistId)?.branch === booking.branch && !bookings.some(b => b.id !== booking.id && b.specialistId === specialistId && active(b) && b.date === booking.date && b.minute < booking.minute + booking.duration && booking.minute < b.minute + b.duration);
}
export function inService(specialistId: string, bookings: Booking[]) {
  return bookings.some(b => b.specialistId === specialistId && b.status === "confirmed" && b.date === TODAY && b.minute <= NOW && b.minute + b.duration > NOW);
}
export type Action = { type: "reset" } | { type: "status"; id: string; status: Status } | { type: "assign"; id: string; specialistId: string };
export function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return initialState();
  const booking = state.bookings.find(b => b.id === action.id);
  if (!booking || !active(booking)) return state;
  if (action.type === "assign" && (!availableFor(action.specialistId, booking, state.bookings) || booking.specialistId === action.specialistId)) return state;
  if (action.type === "status" && !(booking.status === "pending" ? ["confirmed", "cancelled"] : ["completed", "cancelled"]).includes(action.status)) return state;
  const changed = action.type === "status" ? { ...booking, status: action.status } : { ...booking, specialistId: action.specialistId };
  const detail = action.type === "assign" ? specialists.find(s => s.id === action.specialistId)!.name : { en: `${booking.status} → ${action.status}`, ar: `${statusArabic[booking.status]} ← ${statusArabic[action.status]}` };
  return { bookings: state.bookings.map(b => b.id === booking.id ? changed : b), activity: [{ id: `demo-event-${state.activity.length}`, bookingId: booking.id, type: action.type === "assign" ? "SPECIALIST_ASSIGNED" : "BOOKING_UPDATED", category: action.type === "assign" ? "assignments" : "bookings", time: "18:00", detail }, ...state.activity] };
}
export const statusArabic: Record<Status, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي" };
