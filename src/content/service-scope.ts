import type { Locale } from "@/lib/i18n/config";

// Per-service scope, keyed by service slug (CMS) / dictionary id. Wording follows the
// existing service descriptions; it adds structure, not new claims.
export type ServiceScope = { builds: string; problem: string; integrations: string; receive: string };
type ScopeCopy = { labels: Record<keyof ServiceScope, string>; items: Record<string, ServiceScope> };

export const serviceScope: Record<Locale, ScopeCopy> = {
  en: {
    labels: { builds: "What we build", problem: "The problem it solves", integrations: "Integrates with", receive: "You receive" },
    items: {
      web: { builds: "Corporate, marketing, commerce and editorial sites with a managed CMS.", problem: "A presence that is hard to trust, slow to load or hard to update.", integrations: "CMS, forms and lead capture, analytics.", receive: "A fast bilingual site, an editing workflow and the source code." },
      apps: { builds: "Dashboards, portals, SaaS products and internal platforms around a real workflow.", problem: "Work spread across spreadsheets, chats and manual follow-up.", integrations: "Databases, authentication and your existing APIs.", receive: "A role-based application with its data model, tests and deployment." },
      mobile: { builds: "Customer, field-team and operations apps.", problem: "People who need the system away from a desk.", integrations: "The same APIs and data as your web platform.", receive: "Cross-platform apps connected to one backend." },
      automation: { builds: "Booking, CRM, notification and data workflows.", problem: "Repeated manual steps between people and systems.", integrations: "WhatsApp, calendars, databases, CRMs and webhooks.", receive: "Documented workflows with clear states, and human oversight where decisions matter." },
      ai: { builds: "Assistants, classification and decision support inside existing workflows.", problem: "Decisions that require reading large amounts of text or data.", integrations: "Your data sources, through retrieval and guardrails.", receive: "A scoped capability with review points, not an unbounded chatbot." },
      software: { builds: "Software shaped around a specific operational requirement.", problem: "Generic tools that force the business to change how it works.", integrations: "The systems the operation already depends on, through their APIs.", receive: "Maintainable software with its architecture, tests and handover." },
    },
  },
  ar: {
    labels: { builds: "ما نبنيه", problem: "المشكلة التي يحلها", integrations: "يتكامل مع", receive: "ما تستلمه" },
    items: {
      web: { builds: "مواقع للشركات والتسويق والتجارة والمحتوى، مع نظام لإدارة المحتوى.", problem: "حضور رقمي يصعب الوثوق به، أو بطيء التحميل، أو يصعب تحديثه.", integrations: "إدارة المحتوى، والنماذج وجمع العملاء المحتملين، والتحليلات.", receive: "موقع سريع ثنائي اللغة، وآلية تحرير واضحة، والشيفرة المصدرية." },
      apps: { builds: "لوحات تحكم وبوابات ومنتجات SaaS ومنصات داخلية مبنية حول سير عمل حقيقي.", problem: "عمل موزّع بين الجداول والمحادثات والمتابعة اليدوية.", integrations: "قواعد البيانات، والمصادقة، وواجهاتك البرمجية الحالية.", receive: "تطبيق بصلاحيات حسب الأدوار، مع نموذج بياناته واختباراته ونشره." },
      mobile: { builds: "تطبيقات للعملاء والفرق الميدانية والتشغيل.", problem: "أشخاص يحتاجون إلى النظام بعيدًا عن المكتب.", integrations: "الواجهات البرمجية والبيانات نفسها التي تعتمد عليها منصتك على الويب.", receive: "تطبيقات متعددة المنصات مرتبطة بخادم واحد." },
      automation: { builds: "مسارات عمل للحجز وإدارة العملاء والإشعارات والبيانات.", problem: "خطوات يدوية متكررة بين الأشخاص والأنظمة.", integrations: "واتساب، والتقويمات، وقواعد البيانات، وأنظمة إدارة العملاء، وWebhooks.", receive: "مسارات عمل موثّقة بحالات واضحة، وإشراف بشري حيث تكون القرارات مهمة." },
      ai: { builds: "مساعدات وتصنيف ودعم للقرار داخل مسارات العمل القائمة.", problem: "قرارات تتطلب قراءة كميات كبيرة من النصوص أو البيانات.", integrations: "مصادر بياناتك، عبر الاسترجاع والضوابط.", receive: "قدرة محددة النطاق بنقاط مراجعة، لا روبوت محادثة بلا حدود." },
      software: { builds: "برمجيات مصممة حول متطلب تشغيلي محدد.", problem: "أدوات عامة تفرض على العمل أن يغيّر طريقة عمله.", integrations: "الأنظمة التي يعتمد عليها التشغيل بالفعل، عبر واجهاتها البرمجية.", receive: "برمجيات قابلة للصيانة مع بنيتها واختباراتها وتسليمها." },
    },
  },
};
