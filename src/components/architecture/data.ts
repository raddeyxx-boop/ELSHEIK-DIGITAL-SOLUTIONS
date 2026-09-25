import type { Locale } from "@/lib/i18n/config";
import type { ArchitectureConnectionData, ArchitectureNodeData } from "./types";

export function getRelaxMoonArchitecture(locale: Locale): { nodes: ArchitectureNodeData[]; connections: ArchitectureConnectionData[] } {
  const ar = locale === "ar";
  const nodes: ArchitectureNodeData[] = [
    { id: "customer", label: ar ? "العميل" : "Customer", description: ar ? "يبدأ رحلة الحجز عبر قناة مألوفة." : "Starts the booking journey in a familiar channel.", type: "channel", layer: 0 },
    { id: "whatsapp", label: "WhatsApp", description: ar ? "واجهة المحادثة بين العميل والنظام." : "The conversational interface between customer and system.", type: "channel", layer: 1 },
    { id: "meta", label: ar ? "واجهة Meta السحابية" : "Meta Cloud API", description: ar ? "طبقة الربط الرسمية للرسائل." : "Official message integration layer.", type: "integration", layer: 2 },
    { id: "automation", label: ar ? "تنسيق الأتمتة" : "Automation orchestration", description: ar ? "ينسق التوفر والجدولة والتعديل والإلغاء والإشعارات." : "Coordinates availability, scheduling, changes, cancellation, and notifications.", type: "automation", layer: 3 },
    { id: "logic", label: ar ? "منطق الحجز" : "Booking logic", description: ar ? "يطبق قواعد الحجز المبسطة دون كشف منطق داخلي خاص." : "Applies sanitized booking rules without exposing private logic.", type: "logic", layer: 4 },
    { id: "calendar", label: ar ? "التقويم" : "Calendar", description: ar ? "يمثل جدول المواعيد والتوفر." : "Represents schedule and availability.", type: "service", layer: 5 },
    { id: "database", label: ar ? "قاعدة البيانات" : "Database", description: ar ? "تحفظ سجلات التشغيل المصرح بها." : "Stores permitted operational records.", type: "service", layer: 5 },
    { id: "notifications", label: ar ? "إشعارات التشغيل" : "Operations notifications", description: ar ? "تُبقي فريق التشغيل على اطلاع." : "Keeps the operations team informed.", type: "service", layer: 5 },
    { id: "confirmation", label: ar ? "تأكيد الحجز" : "Booking confirmation", description: ar ? "يستلم العميل استجابة واضحة." : "Returns a clear response to the customer.", type: "output", layer: 6 },
  ];
  return { nodes, connections: [{ source: "customer", target: "whatsapp" }, { source: "whatsapp", target: "meta" }, { source: "meta", target: "automation" }, { source: "automation", target: "logic" }, { source: "logic", target: "calendar" }, { source: "logic", target: "database" }, { source: "logic", target: "notifications" }, { source: "calendar", target: "confirmation" }, { source: "database", target: "confirmation" }, { source: "notifications", target: "confirmation" }] };
}

