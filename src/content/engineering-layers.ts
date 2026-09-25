import type { Locale } from "@/lib/i18n/config";

// Engineering-philosophy article for the Technologies page. Claims describe how this
// platform is built (server rendering, server-only modules, Zod validation, Supabase
// RLS and roles, Vitest/Playwright in CI) and the automation layer used in case
// studies. Observability is omitted: it is not implemented.
type Layer = { name: string; tools: string; responsibility: string; boundary: string; communicates: string; security: string };
type EngineeringCopy = { label: string; title: string; intro: string; fields: { boundary: string; communicates: string; security: string }; layers: Layer[]; closing: string };

export const engineeringLayers: Record<Locale, EngineeringCopy> = {
  en: {
    label: "ENGINEERING LAYERS",
    title: "Every layer has one job.",
    intro: "A tool earns its place by owning a responsibility with a clear boundary. This is how this platform itself is built.",
    fields: { boundary: "Boundary", communicates: "Talks to", security: "Security" },
    layers: [
      { name: "Frontend", tools: "Next.js · React · TypeScript", responsibility: "Interfaces render on the server first and send only the JavaScript an interaction needs.", boundary: "No credentials or private data reach the browser.", communicates: "Server components, route handlers and server actions.", security: "Everything the browser submits is validated again on the server." },
      { name: "Backend", tools: "Route handlers · Server actions", responsibility: "Business rules, validation and access decisions run on the server.", boundary: "Server-only modules are never bundled for the client.", communicates: "The database and the CMS.", security: "Schema validation (Zod), a honeypot field and rate limiting on public form submissions." },
      { name: "Data", tools: "Supabase · PostgreSQL", responsibility: "Structured records with explicit relationships between content, media and enquiries.", boundary: "Row-level security on every table; public reads are limited to published content.", communicates: "Server-side clients.", security: "Editor and admin roles are checked by database policies, not only by the interface." },
      { name: "Automation", tools: "n8n · Webhooks · APIs", responsibility: "Orchestrates multi-step workflows between channels, records and schedules.", boundary: "Workflows own the integration steps; applications own the product experience.", communicates: "Messaging channels, databases and calendars through their APIs.", security: "Integration credentials stay in the workflow platform, never in the interface." },
      { name: "Security", tools: "Auth · RLS · Access control · Validation", responsibility: "Decides who can read or change what, at every layer.", boundary: "Checks are enforced where the data lives, not only in the interface.", communicates: "Supabase Auth sessions and role checks in server actions.", security: "Security headers, no framing, and uploads checked by type and size." },
      { name: "Testing", tools: "Vitest · Playwright", responsibility: "Unit tests for rules; browser tests for real journeys in English and Arabic.", boundary: "Browser tests run against isolated fixtures and fail on unexpected external requests.", communicates: "Continuous integration on every pull request.", security: "Tests never use production data or credentials." },
      { name: "Deployment", tools: "Vercel or equivalent Node hosting", responsibility: "Production builds with streamed rendering, so independent content is not held up by slower sources.", boundary: "Environment secrets live in the host, not in the repository.", communicates: "The CMS and data layer over authenticated connections.", security: "Lint, type checks, tests and a production build run before changes ship." },
    ],
    closing: "Tools are replaceable. Responsibilities and boundaries are what keep a system understandable.",
  },
  ar: {
    label: "طبقات الهندسة",
    title: "لكل طبقة مهمة واحدة.",
    intro: "تستحق الأداة مكانها حين تتولى مسؤولية واحدة بحدود واضحة. هكذا بُنيت هذه المنصة نفسها.",
    fields: { boundary: "الحدود", communicates: "تتصل بـ", security: "الأمان" },
    layers: [
      { name: "الواجهة الأمامية", tools: "Next.js · React · TypeScript", responsibility: "تُعرض الواجهات على الخادم أولًا، ولا يُرسل إلى المتصفح إلا ما يحتاجه التفاعل من JavaScript.", boundary: "لا تصل بيانات الاعتماد ولا البيانات الخاصة إلى المتصفح.", communicates: "مكوّنات الخادم ومعالجات المسارات وإجراءات الخادم.", security: "يُعاد التحقق على الخادم من كل ما يرسله المتصفح." },
      { name: "الخادم", tools: "Route handlers · Server actions", responsibility: "تُنفَّذ قواعد العمل والتحقق وقرارات الصلاحيات على الخادم.", boundary: "لا تُضمَّن وحدات الخادم في حزم المتصفح.", communicates: "قاعدة البيانات ونظام إدارة المحتوى.", security: "تحقق بالمخططات (Zod)، وحقل مصيدة للبريد المزعج، وحدّ لمعدل الإرسال في النماذج العامة." },
      { name: "البيانات", tools: "Supabase · PostgreSQL", responsibility: "سجلات منظمة بعلاقات صريحة بين المحتوى والوسائط والاستفسارات.", boundary: "أمان على مستوى الصفوف في كل جدول، والقراءة العامة مقصورة على المحتوى المنشور.", communicates: "عملاء الخادم فقط.", security: "تتحقق سياسات قاعدة البيانات من دوري المحرر والمسؤول، لا الواجهة وحدها." },
      { name: "الأتمتة", tools: "n8n · Webhooks · APIs", responsibility: "تنسّق مسارات العمل متعددة الخطوات بين القنوات والسجلات والمواعيد.", boundary: "تتولى مسارات العمل خطوات التكامل، وتتولى التطبيقات تجربة المنتج.", communicates: "قنوات المراسلة وقواعد البيانات والتقويمات عبر واجهاتها البرمجية.", security: "تبقى بيانات اعتماد التكاملات في منصة الأتمتة، ولا تظهر في الواجهة أبدًا." },
      { name: "الأمان", tools: "Auth · RLS · Access control · Validation", responsibility: "تحديد من يمكنه قراءة ماذا أو تغييره، في كل طبقة.", boundary: "تُفرض الضوابط حيث توجد البيانات، لا في الواجهة وحدها.", communicates: "جلسات Supabase Auth والتحقق من الأدوار في إجراءات الخادم.", security: "ترويسات أمان، ومنع التضمين في إطارات، وفحص نوع الملفات المرفوعة وحجمها." },
      { name: "الاختبار", tools: "Vitest · Playwright", responsibility: "اختبارات وحدات للقواعد، واختبارات متصفح لرحلات حقيقية بالعربية والإنجليزية.", boundary: "تعمل اختبارات المتصفح على بيانات معزولة، وتفشل عند أي طلب خارجي غير متوقع.", communicates: "التكامل المستمر مع كل طلب دمج.", security: "لا تستخدم الاختبارات بيانات الإنتاج ولا بيانات اعتماده." },
      { name: "النشر", tools: "Vercel · Node", responsibility: "إصدارات إنتاج بعرض متدفق، فلا يتأخر المحتوى المستقل بانتظار المصادر الأبطأ.", boundary: "تُحفظ أسرار البيئة لدى جهة الاستضافة، لا في المستودع.", communicates: "نظام إدارة المحتوى وطبقة البيانات عبر اتصالات موثّقة.", security: "يسبق كل تغيير فحصُ الشيفرة والأنواع والاختبارات وبناءُ نسخة الإنتاج." },
    ],
    closing: "الأدوات قابلة للاستبدال؛ المسؤوليات والحدود هي ما يبقي النظام مفهومًا.",
  },
};
