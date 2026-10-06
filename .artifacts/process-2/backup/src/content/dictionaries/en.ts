import { aboutEnglish } from './about';
import type { Dictionary } from "./types";

export const en: Dictionary = {
  localeName: "العربية",
  featuredCase: {
    slogan: ["WELLNESS", "MEETS", "AUTOMATION."],
    steps: ["Customer request", "WhatsApp", "Automation engine", "Check availability", "Assign specialist", "Calendar & database", "Confirmation sent"],
    phoneName: "Relax Moon Spa",
    phoneAccount: "Business Account",
    messages: ["Hello! I'd like to book an appointment.", "What service would you like?", "Massage Therapy", "Great. When would you like to come?", "Tomorrow at 5 PM", "Your appointment is confirmed."],
  },
  nav: { home: "Home", services: "Services", work: "Work", about: "About", insights: "Insights", contact: "Contact", start: "Start a project", menu: "Open menu", close: "Close menu" },
  common: { learnMore: "Learn more", viewCase: "View case study", sample: "Sanitized demonstration", platformUses: "Used by this platform" },
  hero: { eyebrow: "Digital product engineering", titleA: "Digital systems,", titleB: "engineered for real business.", body: "We design and build high-performance websites, applications, automation systems, and intelligent digital products that connect technology with real operations.", primary: "Start a project", secondary: "Explore our work" },
  capability: { eyebrow: "What we build", title: "From first interaction to core operation.", items: [
    { title: "Digital Presence", body: "Distinctive, fast websites designed to establish trust and move people to act." },
    { title: "Business Applications", body: "Focused tools and platforms that make complex work easier to manage." },
    { title: "Connected Operations", body: "Automations and integrations that remove repetition between people and systems." },
    { title: "Intelligent Systems", body: "Purposeful AI experiences grounded in clear business rules and reliable data." },
  ] },
  services: { eyebrow: "Capabilities", title: "One engineering practice. Six ways to create leverage.", intro: "Each engagement starts with the operational problem—not a predetermined technology.", items: [
    { id: "web", title: "Web Development", body: "Corporate, marketing, commerce, and editorial experiences with a precise digital identity.", outcome: "Turn attention into qualified action.", tech: "Next.js · React · CMS" },
    { id: "apps", title: "Web Applications", body: "Dashboards, portals, SaaS products, and internal platforms shaped around real workflows.", outcome: "Make critical work clearer and faster.", tech: "TypeScript · APIs · PostgreSQL" },
    { id: "mobile", title: "Mobile Applications", body: "Customer and operational apps with robust backend and integration foundations.", outcome: "Put the right capability where work happens.", tech: "Cross-platform · API integration" },
    { id: "automation", title: "Automation", body: "Connected booking, CRM, notification, and data workflows with human oversight.", outcome: "Reduce repetitive operational effort.", tech: "n8n · Webhooks · APIs" },
    { id: "ai", title: "AI & Intelligent Systems", body: "Assistants, classification, routing, and knowledge experiences designed for a defined job.", outcome: "Apply intelligence where it improves a decision.", tech: "LLMs · Retrieval · Guardrails" },
    { id: "software", title: "Custom Software", body: "Purpose-built backend systems, databases, APIs, and operational tools.", outcome: "Fit technology to the business—not the reverse.", tech: "Architecture · Security · Data" },
  ] },
  work: { eyebrow: "Selected work", title: "Systems explained through the work they improve.", intro: "Public case studies reveal the business journey and sanitized architecture without exposing private implementation.", exampleLabel: "Sanitized project demonstration", name: "Relax Moon Spa Automation", industry: "Service operations", summary: "A demonstration of how conversational booking can coordinate availability, scheduling, records, and operational notifications.", services: "WhatsApp automation · Booking operations", year: "Example" },
  automation: { eyebrow: "Automation, made understandable", title: "One conversation. A coordinated operational system.", body: "This sanitized view shows the responsibility of each layer while keeping credentials, endpoints, customer data, and proprietary logic private." },
  journey: { eyebrow: "Customer journey", title: "A booking experience with no operational maze.", steps: ["Start conversation", "Choose service", "Select date", "Select time", "Availability check", "Provide details", "Confirm", "Receive confirmation"] },
  demo: { label: "Interactive simulation", title: "Try the booking flow", system: "Booking assistant", chooseService: "Choose a service.", chooseDate: "Choose a date.", chooseTime: "Choose a time.", checking: "Checking simulated availability…", available: "That appointment is available.", confirmed: "Booking confirmed — demonstration only.", disclaimer: "Local simulation only. No messages, bookings, or external systems are triggered.", reset: "Reset demo", services: ["Swedish massage", "Thai massage"], dates: ["Tuesday, 10 September", "Wednesday, 11 September"], times: ["10:00", "14:30", "18:00"] },
  process: { eyebrow: "How we work", title: "A disciplined path from ambiguity to a dependable system.", items: [
    { number: "01", title: "Discover", body: "Understand the business, users, constraints, and opportunity." }, { number: "02", title: "Strategy", body: "Define outcomes, scope, architecture, and evidence of success." }, { number: "03", title: "Design", body: "Shape information, interaction, interface, and content as one system." }, { number: "04", title: "Engineering", body: "Build maintainable product foundations with clear boundaries." }, { number: "05", title: "Automation", body: "Connect operations where reliable orchestration creates leverage." }, { number: "06", title: "Testing", body: "Verify behavior, access, resilience, and edge cases." }, { number: "07", title: "Deployment", body: "Release through controlled environments and observable infrastructure." }, { number: "08", title: "Iteration", body: "Improve with real usage, operational feedback, and evidence." },
  ] },
  technology: { eyebrow: "Technology ecosystem", title: "Tools selected by responsibility, not fashion.", groups: [{ title: "Interface", items: ["Next.js", "React", "TypeScript"] }, { title: "Data", items: ["Supabase", "PostgreSQL"] }, { title: "Automation", items: ["n8n", "APIs", "Webhooks"] }, { title: "Quality", items: ["Vitest", "Playwright"] }, { title: "Infrastructure", items: ["Vercel", "Supabase"] }] },
  reliability: { eyebrow: "Built for the real world", title: "Quality is an architectural decision.", items: ["Secure architecture", "Maintainable systems", "Business-aware automation", "Reliable integrations", "Production-focused engineering"] },
  insight: { eyebrow: "Field notes", title: "Thinking for better digital decisions.", category: "Automation", article: "When should a business automate its booking process?", summary: "A practical framework for deciding when automation removes friction—and when it simply moves it elsewhere.", read: "Read the perspective" },
  cta: { eyebrow: "Start a conversation", title: "Have a serious digital challenge?", body: "Let’s engineer the right system around the way your business actually works.", button: "Start a project" },
  about: aboutEnglish,
  contact: { eyebrow: "Start a project", title: "Tell us what needs to work better.", lead: "A useful first conversation begins with the business challenge, the people affected, and the outcome you need.", fields: { name: "Name", company: "Company", email: "Email", phone: "Phone", country: "Country", service: "Service", budget: "Budget range", timeline: "Timeline", description: "Project description", select: "Select an option", optional: "Optional" }, submit: "Send project brief", submitting: "Sending…", success: "Your brief was validated successfully. We’ll continue the conversation from here.", devNotice: "Development mode: this brief is validated but not persisted until Supabase is configured.", required: "Please complete this field." },
  footer: { statement: "Digital systems, engineered for real business.", explore: "Explore", services: "Capabilities", contact: "Contact", rights: "All rights reserved." },
};
