import type { Locale } from "@/lib/i18n/config";

// Context shown above the (unchanged) enquiry form. No response-time promises: the
// only evidenced step is that the brief is stored and reviewed.
type ContactContext = { label: string; topicsTitle: string; topics: string[]; prepareTitle: string; prepare: string[]; nextTitle: string; next: string[] };

export const contactContext: Record<Locale, ContactContext> = {
  en: {
    label: "BEFORE YOU WRITE",
    topicsTitle: "What to contact us about",
    topics: ["A new digital product", "An automation project", "An internal operations system", "An API or system integration", "A WhatsApp workflow", "Improving an existing system"],
    prepareTitle: "What to prepare",
    prepare: ["The process or problem, in your own words", "The systems and tools involved today", "Who uses it, and how often", "Any timing or budget constraints"],
    nextTitle: "What happens next",
    next: ["Your brief is stored securely and reviewed.", "We reply to discuss scope, constraints and the systems involved.", "If there is a fit, we propose an approach before anything is built."],
  },
  ar: {
    label: "قبل أن تكتب",
    topicsTitle: "ما الذي يمكنك التواصل بشأنه",
    topics: ["منتج رقمي جديد", "مشروع أتمتة", "نظام تشغيل داخلي", "تكامل عبر API أو بين الأنظمة", "مسار عمل عبر واتساب", "تطوير نظام قائم"],
    prepareTitle: "ما الذي تجهّزه",
    prepare: ["العملية أو المشكلة بكلماتك", "الأنظمة والأدوات المستخدمة حاليًا", "من يستخدمها وبأي وتيرة", "أي قيود على التوقيت أو الميزانية"],
    nextTitle: "ماذا يحدث بعد ذلك",
    next: ["يُحفظ طلبك بأمان ويُراجع.", "نتواصل معك لمناقشة النطاق والقيود والأنظمة المعنية.", "إن كان التوافق واضحًا، نقترح نهجًا قبل البدء في أي بناء."],
  },
};
