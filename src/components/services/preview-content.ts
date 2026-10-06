export type PreviewKind =
  "web" | "apps" | "mobile" | "automation" | "ai" | "software";

// Both published CMS slugs and the existing dictionary fallback IDs are stable.
const kinds: Record<string, PreviewKind> = {
  web: "web",
  "web-development": "web",
  apps: "apps",
  "web-applications": "apps",
  mobile: "mobile",
  "mobile-applications": "mobile",
  automation: "automation",
  ai: "ai",
  "ai-systems": "ai",
  "ai-intelligent-systems": "ai",
  software: "software",
  "custom-software": "software",
};
export function previewKind(id: string) {
  return kinds[id];
}

export const previewCopy = {
  en: {
    preview: "Preview",
    close: "Close preview",
    request: "Request",
    workflow: "Workflow",
    database: "Database",
    result: "Sent",
    input: "Input",
    process: "Process",
    decision: "Decision",
    ready: "Complete",
    action: "Confirm",
    dashboard: "Operations",
    customers: "Customers",
    data: "Data",
    payments: "Payments",
    reports: "Reports",
    system: "Custom system",
    descriptions: {
      web: "A website assembles from its layout grid into a complete interface.",
      apps: "An operational dashboard loads records and completes an action.",
      mobile: "A mobile app opens, selects an action and confirms completion.",
      automation:
        "A request passes through a workflow, API and database to a notification.",
      ai: "Inputs enter a processing network and one decision is selected.",
      software: "Business modules connect into one integrated custom system.",
    },
  },
  ar: {
    preview: "معاينة",
    close: "إغلاق المعاينة",
    request: "طلب",
    workflow: "أتمتة",
    database: "البيانات",
    result: "تم الإرسال",
    input: "إدخال",
    process: "معالجة",
    decision: "قرار",
    ready: "مكتمل",
    action: "تأكيد",
    dashboard: "العمليات",
    customers: "العملاء",
    data: "البيانات",
    payments: "المدفوعات",
    reports: "التقارير",
    system: "نظام مخصص",
    descriptions: {
      web: "يتشكل الموقع من شبكة التخطيط إلى واجهة مكتملة.",
      apps: "تحمّل لوحة العمليات السجلات وتنفّذ إجراءً حتى اكتماله.",
      mobile: "يفتح تطبيق الجوال ويحدد إجراءً ثم يؤكد اكتماله.",
      automation:
        "يمر الطلب عبر الأتمتة وواجهة API وقاعدة البيانات وصولًا إلى الإشعار.",
      ai: "تدخل البيانات إلى شبكة المعالجة ويُختار قرار واحد.",
      software: "تتصل وحدات الأعمال لتكوّن نظامًا مخصصًا متكاملًا.",
    },
  },
};
export type PreviewCopy = typeof previewCopy.en;
