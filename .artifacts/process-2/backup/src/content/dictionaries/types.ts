export type Dictionary = {
  localeName: string;
  nav: { home: string; services: string; work: string; about: string; insights: string; contact: string; start: string; menu: string; close: string };
  common: { learnMore: string; viewCase: string; sample: string; platformUses: string };
  featuredCase: {
    slogan: string[];
    steps: [string, string, string, string, string, string, string];
    phoneName: string;
    phoneAccount: string;
    messages: [string, string, string, string, string, string];
  };
  hero: { eyebrow: string; titleA: string; titleB: string; body: string; primary: string; secondary: string };
  capability: { eyebrow: string; title: string; items: { title: string; body: string }[] };
  services: { eyebrow: string; title: string; intro: string; items: { id: string; title: string; body: string; outcome: string; tech: string }[] };
  work: { eyebrow: string; title: string; intro: string; exampleLabel: string; name: string; industry: string; summary: string; services: string; year: string };
  automation: { eyebrow: string; title: string; body: string };
  journey: { eyebrow: string; title: string; steps: string[] };
  demo: { label: string; title: string; system: string; chooseService: string; chooseDate: string; chooseTime: string; checking: string; available: string; confirmed: string; disclaimer: string; reset: string; services: string[]; dates: string[]; times: string[] };
  process: { eyebrow: string; title: string; items: { number: string; title: string; body: string }[] };
  technology: { eyebrow: string; title: string; groups: { title: string; items: string[] }[] };
  reliability: { eyebrow: string; title: string; items: string[] };
  insight: { eyebrow: string; title: string; category: string; article: string; summary: string; read: string };
  cta: { eyebrow: string; title: string; body: string; button: string };
  about: typeof import("./about").aboutEnglish;
  contact: { eyebrow: string; title: string; lead: string; fields: Record<string, string>; submit: string; submitting: string; success: string; devNotice: string; required: string };
  footer: { statement: string; explore: string; services: string; contact: string; rights: string };
};
