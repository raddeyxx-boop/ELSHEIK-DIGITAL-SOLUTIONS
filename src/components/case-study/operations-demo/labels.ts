import { statusArabic, type Locale } from "./data";
const en = {
  overview: "Overview", bookings: "Bookings", team: "Team", customers: "Customers", activity: "Activity", analytics: "Analytics",
  all: "All branches", riyadh: "Riyadh", shq: "Al Sharqiyah", branch: "Branch", reset: "Reset demo", demo: "DEMO DATA",
  pending: "Pending", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled", search: "Search bookings", status: "Status", allStatuses: "All statuses",
  time: "Time", customer: "Customer", service: "Service", specialist: "Specialist", price: "Price", unassigned: "Unassigned", empty: "No matching records. Try another filter.",
  today: "Today's bookings", upcoming: "Upcoming", activeTeam: "Active specialists", assignments: "Pending assignments", schedule: "Today's schedule", viewAll: "View all bookings",
  available: "Available", inService: "In service", availableOnly: "Available now only", next: "Next booking", noNext: "No upcoming booking", inspect: "Inspect schedule",
  history: "Booking history", preferred: "Preferred service", last: "Last booking", notes: "Fictional customer for this commercial demo. No contact information is stored.",
  allEvents: "All events", customerActions: "Customer actions", system: "System events", eventSearch: "Search ID, customer or event", eventFilter: "Event category",
  byStatus: "Bookings by status", byBranch: "Bookings by branch", distribution: "Service distribution", peak: "Booking periods", utilization: "Specialist scheduled hours", analyticsNote: "Derived from the selected branch. Scheduled hours exclude cancelled bookings.",
  close: "Close details", details: "Booking details", previous: "Previous record", nextRecord: "Next record", duration: "Duration", source: "Automation source", timeline: "Timeline", update: "Simulate status change", assign: "Assign specialist", choose: "Choose available specialist", confirmAssignment: "Confirm demo assignment", noSpecialist: "No specialist available for this slot", minutes: "min", date: "Date", currency: "SAR",
  updated: "Demo booking updated", assigned: "Assignment simulated successfully", restored: "Original demo restored", confirm: "Confirm booking", complete: "Complete booking", cancel: "Cancel booking", snapshot: "16 Sep 2026 / 18:00 · simulated clock", results: "records", teamNote: "Availability now is shown below. Assignments check the full booking interval and branch.",
};
const ar: typeof en = {
  overview: "نظرة عامة", bookings: "الحجوزات", team: "الفريق", customers: "العملاء", activity: "النشاط", analytics: "التحليلات",
  all: "كل الفروع", riyadh: "الرياض", shq: "الشرقية", branch: "الفرع", reset: "إعادة ضبط التجربة", demo: "بيانات تجريبية",
  ...statusArabic, search: "البحث في الحجوزات", status: "الحالة", allStatuses: "كل الحالات", time: "الوقت", customer: "العميل", service: "الخدمة", specialist: "الأخصائي", price: "السعر", unassigned: "غير معين", empty: "لا توجد سجلات مطابقة. جرّب تغيير التصفية.",
  today: "حجوزات اليوم", upcoming: "الحجوزات القادمة", activeTeam: "الأخصائيون النشطون", assignments: "بانتظار التعيين", schedule: "جدول اليوم", viewAll: "عرض كل الحجوزات",
  available: "متاح", inService: "في جلسة", availableOnly: "المتاحون الآن فقط", next: "الحجز القادم", noNext: "لا يوجد حجز قادم", inspect: "عرض الجدول",
  history: "سجل الحجوزات", preferred: "الخدمة المفضلة", last: "آخر حجز", notes: "عميل افتراضي للعرض التجاري. لا تُخزّن أي معلومات اتصال.",
  allEvents: "كل الأحداث", customerActions: "إجراءات العملاء", system: "أحداث النظام", eventSearch: "بحث بالمعرف أو العميل أو الحدث", eventFilter: "فئة الحدث",
  byStatus: "الحجوزات حسب الحالة", byBranch: "الحجوزات حسب الفرع", distribution: "توزيع الخدمات", peak: "فترات الحجز", utilization: "ساعات الأخصائيين المجدولة", analyticsNote: "تُحسب من الفرع المحدد. الساعات المجدولة لا تشمل الحجوزات الملغاة.",
  close: "إغلاق التفاصيل", details: "تفاصيل الحجز", previous: "السجل السابق", nextRecord: "السجل التالي", duration: "المدة", source: "مصدر الأتمتة", timeline: "التسلسل الزمني", update: "محاكاة تغيير الحالة", assign: "تعيين أخصائي", choose: "اختر أخصائيًا متاحًا", confirmAssignment: "تأكيد التعيين التجريبي", noSpecialist: "لا يوجد أخصائي متاح لهذا الموعد", minutes: "دقيقة", date: "التاريخ", currency: "ر.س",
  updated: "تم تحديث الحجز التجريبي", assigned: "تمت محاكاة التعيين بنجاح", restored: "تمت استعادة البيانات الأصلية", confirm: "تأكيد الحجز", complete: "إكمال الحجز", cancel: "إلغاء الحجز", snapshot: "١٦ سبتمبر ٢٠٢٦ / ١٨:٠٠ · توقيت تجريبي", results: "سجل", teamNote: "يظهر التوفر الحالي أدناه. يتحقق التعيين من كامل مدة الحجز والفرع.",
};
export const labels = (locale: Locale) => locale === "ar" ? ar : en;
export type Labels = typeof en;
