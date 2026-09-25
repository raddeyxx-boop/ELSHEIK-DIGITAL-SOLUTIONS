import type { Locale } from "@/lib/i18n/config";

// Process page content. Kept out of the shared dictionary on purpose: the
// dictionary is passed to the client header on every route, and this content
// is only needed (server-side) by /[locale]/process.
//
// Methodology only: nothing here states client results, metrics, durations or
// certifications. Mechanisms are described as what we apply by scope and risk.

export type StageField = "objective" | "inputs" | "activities" | "automation" | "gate" | "outputs" | "quality" | "next";
export type Track = { label: string; items: string[] };
export type ProcessStage = {
  id: string;
  number: string;
  code: string;
  title: string;
  short: string;
  objective: string;
  inputs: string[];
  activities: string[];
  tracks?: Track[];
  principle?: string;
  automation: string[];
  gate: { name: string; question: string };
  outputs: string[];
  quality: string[];
  next: string;
};
export type FlowNode = { code: string; label: string; question: string; examples: string[]; note?: string };
type Labelled = { code: string; title: string; body: string };
// A deterministic, local walk-through of the execution model (no system is contacted).
export type ExecutionDemo = {
  model: string; runSuccess: string; runFailure: string; pause: string;
  success: string[];
  failure: { verify: string; retry: string; handoff: string; record: string; notify: string };
};

export type ProcessContent = {
  hero: { eyebrow: string; title: string; lead: string; systemLabel: string };
  framework: { eyebrow: string; title: string; body: string; tablist: string; selected: string; nextLabel: string; loopLabel: string; loopHint: string; fields: Record<StageField, string> };
  stages: ProcessStage[];
  automationByDesign: { eyebrow: string; title: string; body: string; rows: string[]; phases: [foundation: string, orchestration: string, verification: string, operation: string, learning: string] };
  executionModel: { eyebrow: string; title: string; body: string; nodes: FlowNode[]; failure: { code: string; label: string; question: string; from: string; options: { code: string; label: string }[] }; note: string; demo: ExecutionDemo };
  artifacts: { eyebrow: string; title: string; body: string; items: { title: string; stages: string }[] };
  responsibility: { eyebrow: string; title: string; columns: { code: string; title: string; items: string[] }[] };
  gates: { eyebrow: string; title: string; body: string; signalsLabel: string; signalsBody: string; signals: string[] };
  boundary: { eyebrow: string; title: string; body: string; rows: Labelled[] };
  failureFirst: { eyebrow: string; title: string; body: string; conditions: { code: string; label: string }[] };
  security: { eyebrow: string; title: string; body: string; principles: string[] };
  loop: { eyebrow: string; title: string; body: string; evidenceLabel: string; evidence: string[]; arcLabel: string; center: string; stagesLabel: string; controls: { run: string; replay: string; pause: string } };
  cta: { eyebrow: string; title: string; body: string; button: string };
};

const fieldsEn: Record<StageField, string> = { objective: "Objective", inputs: "Inputs", activities: "Activities", automation: "Automation", gate: "Decision gate", outputs: "Outputs", quality: "Quality check", next: "Next stage" };
const fieldsAr: Record<StageField, string> = { objective: "الهدف", inputs: "المدخلات", activities: "الأنشطة", automation: "الأتمتة", gate: "بوابة القرار", outputs: "المخرجات", quality: "فحص الجودة", next: "المرحلة التالية" };

export const processEnglish: ProcessContent = {
  hero: {
    eyebrow: "How we work",
    title: "A disciplined path from ambiguity to a dependable system.",
    lead: "This is the delivery framework we actually work by. Every project moves through one controlled engineering process — from discovery and system definition to implementation, automation, verification, launch and continuous improvement.",
    systemLabel: "DELIVERY SYSTEM / 08 STAGES",
  },
  framework: {
    eyebrow: "01 / DELIVERY SYSTEM",
    title: "Eight stages. Each with inputs, a decision and outputs.",
    body: "Select a stage to see what it needs, what happens inside it, and the gate it must pass before work moves on.",
    tablist: "Delivery system stages",
    selected: "Selected stage",
    nextLabel: "Next stage",
    loopLabel: "Back to discovery",
    loopHint: "New evidence",
    fields: fieldsEn,
  },
  stages: [
    {
      id: "discovery", number: "01", code: "DISCOVERY", title: "Discovery",
      short: "Understand the real problem before proposing a solution.",
      objective: "Understand the business problem, the people it affects and how work actually happens today — before any solution is designed.",
      inputs: ["Stakeholder goals and requirements", "Current workflows and handoffs", "Existing systems and data sources", "Business rules and operational constraints", "User pain points"],
      activities: ["Define the business objective and success criteria", "Map users, roles and the current workflow", "Inventory systems, data sources and required integrations", "Record constraints, security considerations and early risks"],
      automation: ["Automation analysis starts here", "Repeated manual tasks and duplicate data entry", "Handoffs, approvals and status updates", "Notifications, scheduling and data synchronization", "Each is recorded as a candidate — not a promise"],
      gate: { name: "Problem understood", question: "Do we understand the problem well enough to define the system?" },
      outputs: ["Problem definition", "Requirements map", "Workflow map", "Integration inventory", "Automation opportunities", "Initial risk register"],
      quality: ["The problem is stated in business terms, not as a feature list", "Success criteria are observable", "Unknowns are recorded, not assumed"],
      next: "Findings become a system plan.",
    },
    {
      id: "strategy", number: "02", code: "STRATEGY", title: "Strategy",
      short: "Turn findings into a scoped system plan.",
      objective: "Turn discovery findings into a scoped system plan: what will be built, in what order, and where its boundaries sit.",
      inputs: ["Discovery outputs", "Business priorities", "Budget and timeline constraints", "Risk register"],
      activities: ["Define scope and priorities", "Define user journeys and system boundaries", "Decide the integration strategy and data ownership", "Separate the first release from later phases", "Prioritize risks"],
      automation: ["Set automation boundaries: what runs automatically, what stays manual", "Rank candidates by value, frequency and risk", "Identify the data each workflow will depend on"],
      gate: { name: "Scope approved", question: "Does the proposed system solve the right operational problem at an acceptable level of complexity?" },
      outputs: ["Solution scope", "System map", "Prioritized requirements", "Automation plan", "Delivery phases", "Architecture direction"],
      quality: ["Every scoped item traces back to a discovered need", "Boundaries between systems are explicit", "What is out of scope is written down"],
      next: "The plan is designed as experience and system behavior.",
    },
    {
      id: "design", number: "03", code: "DESIGN", title: "Design",
      short: "Design the experience and the system behavior together.",
      objective: "Define how people move through the system and how the system responds in every state — not only how the screens look.",
      inputs: ["Scope and system map", "User journeys", "Brand and content", "Accessibility requirements"],
      activities: ["Design flows and system states before visual detail", "Specify responsive and bidirectional behavior"],
      tracks: [
        { label: "Experience design", items: ["User flows", "Information architecture", "Interaction patterns", "Responsive behavior", "Accessibility"] },
        { label: "System experience", items: ["States", "Errors", "Loading", "Empty states", "Permissions", "Operational feedback"] },
        { label: "Interface system", items: ["Components", "Typography", "Spacing", "Visual hierarchy", "RTL / LTR behavior"] },
      ],
      automation: ["Reusable component systems", "Tokenized styles", "Schema-driven forms", "Reusable state patterns", "The automated path and its manual fallback are designed together"],
      gate: { name: "States defined", question: "Are the experience and every system state defined well enough to build?" },
      outputs: ["User flows", "Wireframes", "Interface specifications", "Responsive states", "Interaction rules", "Component requirements"],
      quality: ["Every flow has loading, empty and error states", "Keyboard and screen-reader paths are considered", "Arabic and English layouts are designed together, not mirrored afterwards"],
      next: "Specifications become production code.",
    },
    {
      id: "engineering", number: "04", code: "ENGINEERING", title: "Engineering",
      short: "Build maintainable foundations with explicit boundaries.",
      objective: "Build the product on foundations that are secure, testable and maintainable, with clear boundaries between interface, logic, data and integrations.",
      principle: "We choose technologies by responsibility, not popularity.",
      inputs: ["Interface specifications", "System map and architecture direction", "Integration inventory", "Security requirements"],
      activities: ["Frontend and backend architecture", "API boundaries and contracts", "Database modeling", "Authentication and authorization", "Validation, state management and error handling", "Integrations and environment configuration"],
      automation: ["Build the APIs, data structures and integration layer that workflows depend on", "Keep workflow triggers explicit in the data model", "Configure environments so workflows behave consistently"],
      gate: { name: "Core engineering complete", question: "Is the core engineering complete, with correct boundaries and handled failure paths?" },
      outputs: ["Production code", "API contracts", "Database schema", "Integration layer", "Authentication and authorization", "Configuration", "Technical documentation"],
      quality: ["Core flows work end to end", "Untrusted input is validated", "Permission boundaries are enforced server-side", "Failure paths return controlled errors", "No secrets in client code"],
      next: "Foundations are ready for workflow orchestration.",
    },
    {
      id: "automation", number: "05", code: "AUTOMATION", title: "Automation",
      short: "Turn repeated operations into verifiable workflows.",
      objective: "Turn repeated operations and business rules into workflows that can be executed, verified and observed.",
      inputs: ["Automation plan and boundaries", "APIs and the data layer", "Business rules", "Human approval points"],
      activities: ["Define each workflow’s trigger, context and decisions", "Implement actions against the real systems", "Verify results instead of assuming success", "Design failure paths: retry, fallback, alert, human", "Record execution state for operational visibility"],
      automation: ["Orchestrated through the execution model: event, context, decision, action, verification", "Tools chosen per responsibility — workflow engines such as n8n, webhooks or direct APIs"],
      gate: { name: "Automation verified", question: "Does every workflow verify its result and handle failure in a controlled way?" },
      outputs: ["Automation workflows", "Integration connections", "Failure and escalation paths", "Execution records"],
      quality: ["A sent request is not treated as success", "Duplicate events do not create duplicate actions", "Failures reach a person when they should"],
      next: "Features and workflows enter verification.",
    },
    {
      id: "testing", number: "06", code: "TESTING", title: "Testing",
      short: "Verify the happy path, the failure paths and everything between.",
      objective: "Verify that the system behaves correctly — including when dependencies fail, data is wrong or people do the unexpected.",
      inputs: ["Built features and workflows", "Acceptance criteria", "Known risks and edge cases"],
      activities: ["Functional — does each feature behave correctly?", "Integration — do connected systems communicate correctly?", "Failure paths — what happens when a dependency fails?", "Responsive — does it work across viewport sizes?", "Accessibility — keyboard, semantics, reduced motion", "Performance — loading and runtime behavior", "Regression — did new changes break what worked?", "Automation — do workflows handle expected and unexpected states?"],
      automation: ["Automated unit and browser tests where they add real confidence", "Branch and failure testing for every workflow", "Regression checks before each release"],
      gate: { name: "Regression passed", question: "Are critical flows and their failure states verified — not only the happy path?" },
      outputs: ["Verified flows", "Resolved defects", "Regression coverage", "Launch readiness status"],
      quality: ["Nothing launches just because the happy path works", "Defects are fixed or explicitly accepted", "Tests reflect real use, not only ideal data"],
      next: "Verified builds move to a controlled release.",
    },
    {
      id: "launch", number: "07", code: "LAUNCH", title: "Launch",
      short: "Release to production under control.",
      objective: "Move the system into production in a controlled way, and confirm that its core paths work in the real environment.",
      inputs: ["Launch-ready build", "Production configuration", "Migration plan", "Domain and integration credentials, held server-side"],
      activities: ["Validate production configuration and environment variables", "Apply database migrations", "Deploy and configure the domain", "Verify integrations in production", "Smoke-test the core paths", "Know how to roll back before it is needed"],
      automation: ["Validate workflow execution against real production services", "Confirm triggers, credentials and webhooks per environment", "Watch the first executions closely"],
      gate: { name: "Production validated", question: "Are the core paths verified in production?" },
      outputs: ["A production system with verified core paths", "Deployment configuration", "Operational runbook, where scope requires it"],
      quality: ["Environments differ only where intended", "No test data in production", "Monitoring is in place before real usage arrives"],
      next: "Real usage starts producing evidence.",
    },
    {
      id: "evolution", number: "08", code: "EVOLUTION", title: "Evolution",
      short: "Improve from evidence, then return to discovery.",
      objective: "Improve the system based on how it is actually used and operated — not on assumptions.",
      inputs: ["Usage feedback", "Operational issues", "Performance data", "Execution records"],
      activities: ["Review reliability and performance", "Address technical debt and security updates", "Assess scaling requirements", "Prioritize product improvements"],
      automation: ["Find new automation opportunities in real operation", "Optimize workflows from execution evidence", "Retire automations that no longer earn their place"],
      gate: { name: "Evidence collected", question: "Is there enough evidence to justify the next change?" },
      outputs: ["Improvement backlog", "Updated requirements", "New input for discovery"],
      quality: ["Changes are driven by evidence", "Security updates are not deferred indefinitely", "Every improvement passes through the same gates"],
      next: "New evidence returns to 01 Discovery.",
    },
  ],
  automationByDesign: {
    eyebrow: "02 / AUTOMATION BY DESIGN",
    title: "Automation is not a final stage.",
    body: "Automation opportunities are identified in discovery, bounded in strategy, designed as states and built on engineered foundations — then tested and observed in production. Stage 05 is where workflows are implemented and orchestrated in depth; automation thinking starts long before it.",
    rows: ["Identify manual friction", "Define automation boundaries", "Design automated and manual states", "Build API, data and integration foundations", "Orchestrate workflows", "Verify branches and failures", "Validate production execution", "Optimize from real operational evidence"],
    phases: ["Foundation", "Orchestration", "Verification", "Operation", "Learning"],
  },
  executionModel: {
    eyebrow: "03 / EXECUTION MODEL",
    title: "Every workflow answers the same seven questions.",
    body: "Automation is not connecting API A to API B. It is a chain of verifiable decisions, where every step has one clear responsibility.",
    nodes: [
      { code: "EVENT", label: "Event", question: "What starts the workflow?", examples: ["Customer message", "Form submission", "Booking request", "Record update", "Scheduled event", "Webhook", "State change"] },
      { code: "CONTEXT", label: "Context", question: "What does it need to know?", examples: ["Customer", "Booking", "Current state", "Availability", "Permissions", "Previous actions"] },
      { code: "DECISION", label: "Decision", question: "What must be decided?", examples: ["Valid request?", "Duplicate?", "Available?", "Authorized?", "Which branch?", "Retry or stop?"] },
      { code: "ACTION", label: "Action", question: "What happens automatically?", examples: ["API request", "Database update", "Calendar update", "Assignment", "Document creation", "Status transition"] },
      { code: "VERIFY", label: "Verify", question: "Did it actually succeed?", examples: ["Response validation", "Database confirmation", "External system response", "State check"], note: "A sent request is not a success." },
      { code: "RECORD", label: "Record", question: "What can we see later?", examples: ["Execution state", "Logs", "Timestamps", "Errors"] },
      { code: "NOTIFY", label: "Notify", question: "Who needs to know?", examples: ["Customer confirmation", "Team update", "Operator alert"] },
    ],
    failure: {
      code: "FAILURE PATH", label: "Failure path", question: "What happens when verification fails?", from: "from VERIFY",
      options: [{ code: "RETRY", label: "Retry" }, { code: "FALLBACK", label: "Controlled fallback" }, { code: "ERROR", label: "Clear error state" }, { code: "ALERT", label: "Operational alert" }, { code: "HUMAN", label: "Human intervention" }],
    },
    note: "This is a method, not a checklist applied wholesale to every project. Mechanisms are chosen by the importance and risk of each workflow.",
    demo: {
      model: "Explanatory model · not connected to a live system",
      runSuccess: "Run: verified path", runFailure: "Run: verification fails", pause: "Pause",
      success: [
        "A booking request arrives.",
        "The customer, the requested slot and the current booking state are loaded.",
        "The request is valid and the slot is free: continue to assignment.",
        "The calendar entry is written and a specialist is assigned.",
        "The calendar and the database both confirm the booking.",
        "The execution state, timestamps and result are stored.",
        "The customer is confirmed; the team sees the new booking.",
      ],
      failure: {
        verify: "The calendar returns no confirmation. A sent request is not a success.",
        retry: "One controlled retry. Still unconfirmed.",
        handoff: "The booking is held as pending and an operator is alerted to resolve it.",
        record: "The failure, the retry and the hand-off are recorded.",
        notify: "The customer is told the booking is being confirmed; the team is alerted.",
      },
    },
  },
  artifacts: {
    eyebrow: "04 / DELIVERY ARTIFACTS",
    title: "You receive an engineered system, not a set of screens.",
    body: "Depending on project scope, the process produces some or all of these artifacts. Each records a decision that can be revisited later.",
    items: [
      { title: "Requirements map", stages: "01" }, { title: "User flows", stages: "03" }, { title: "System architecture", stages: "02 · 04" },
      { title: "Data model", stages: "04" }, { title: "API contracts", stages: "04" }, { title: "Interface system", stages: "03" },
      { title: "Automation workflows", stages: "05" }, { title: "Test coverage", stages: "06" }, { title: "Deployment configuration", stages: "07" },
      { title: "Technical documentation", stages: "04–08" }, { title: "Operational runbook", stages: "07" },
    ],
  },
  responsibility: {
    eyebrow: "05 / RESPONSIBILITY",
    title: "Four responsibilities. One system.",
    columns: [
      { code: "DESIGN", title: "What we design", items: ["User experience", "System behavior", "Data flows", "Operational states"] },
      { code: "ENGINEER", title: "What we engineer", items: ["Frontend", "Backend", "APIs", "Databases", "Authentication", "Integrations"] },
      { code: "AUTOMATE", title: "What we automate", items: ["Workflow transitions", "Notifications", "Scheduling", "Synchronization", "Repetitive operational actions"] },
      { code: "VERIFY", title: "What we verify", items: ["Functionality", "Integrations", "Failures", "Performance", "Security boundaries", "Responsive behavior"] },
    ],
  },
  gates: {
    eyebrow: "06 / SYSTEM GATES",
    title: "No stage moves on before it passes its gate.",
    body: "A gate is not a formal meeting. It is a clear engineering question whose answer must be yes before work continues.",
    signalsLabel: "QUALITY SIGNALS",
    signalsBody: "We describe quality by what can be verified — not by invented numbers.",
    signals: ["Tested critical paths", "Explicit system boundaries", "Documented integrations", "Failure-aware workflows", "Responsive interfaces", "Accessible interactions", "Controlled production configuration"],
  },
  boundary: {
    eyebrow: "07 / HUMAN + AUTOMATION",
    title: "We don’t automate a decision just because we can.",
    body: "For every workflow, we decide where automation ends and human judgement begins.",
    rows: [
      { code: "AUTO", title: "What should run automatically", body: "Repeated, rule-based steps with results that can be verified." },
      { code: "APPROVE", title: "What needs human approval", body: "Decisions with financial, contractual or customer impact." },
      { code: "VISIBLE", title: "What needs operational visibility", body: "Steps the team must be able to see, review and explain." },
      { code: "HOLD", title: "When data or confidence is insufficient", body: "The workflow pauses and hands over instead of guessing." },
      { code: "UNDO", title: "What must remain reversible", body: "Actions that must be correctable without losing data." },
    ],
  },
  failureFirst: {
    eyebrow: "08 / FAILURE-FIRST ENGINEERING",
    title: "We design for the happy path — and for what happens when things don’t go as expected.",
    body: "For every critical flow we ask how the system behaves when part of it breaks. This is an engineering philosophy; its mechanisms are applied according to each flow’s importance and risk.",
    conditions: [
      { code: "UNAVAILABLE", label: "Unavailable APIs" }, { code: "INVALID", label: "Invalid data" }, { code: "DUPLICATE", label: "Duplicate actions" },
      { code: "TIMEOUT", label: "Timeouts" }, { code: "MISSING", label: "Missing state" }, { code: "FORBIDDEN", label: "Permission failures" }, { code: "DOWNTIME", label: "Third-party downtime" },
    ],
  },
  security: {
    eyebrow: "SECURITY BY DESIGN",
    title: "Security is an architectural decision, not a later layer.",
    body: "Principles we build by from the first line of code.",
    principles: ["Secrets stay server-side", "Untrusted input is validated", "Minimum required permissions", "Explicit authorization boundaries", "Safe data handling", "Controlled integration access"],
  },
  loop: {
    eyebrow: "09 / FEEDBACK LOOP",
    title: "Launch is not the end. Evidence returns the process to the start.",
    body: "Stage 08 feeds Stage 01 with new evidence from real usage and operation, so every improvement passes through the same gates.",
    evidenceLabel: "EVIDENCE SOURCES",
    evidence: ["Usage feedback", "Operational issues", "Performance", "Automation opportunities", "Reliability", "Technical debt", "Security updates", "Scaling requirements"],
    arcLabel: "NEW EVIDENCE",
    center: "DELIVERY / LOOP",
    stagesLabel: "Feedback loop stages",
    controls: { run: "Run loop", replay: "Replay", pause: "Pause" },
  },
  cta: {
    eyebrow: "10 / NEXT MOVE",
    title: "Let’s build the system your business needs now.",
    body: "If you have a manual process, disconnected systems, or a product that needs engineering or automation, we start by understanding the process — before writing the first line of the solution.",
    button: "Start a project",
  },
};

export const processArabic: ProcessContent = {
  hero: {
    eyebrow: "كيف نعمل",
    title: "مسار منضبط يحوّل الغموض إلى نظام موثوق.",
    lead: "هذا هو إطار التسليم الذي نعمل به فعليًا. يمر كل مشروع بمسار هندسي مضبوط واحد: من الاكتشاف وتعريف النظام، إلى التنفيذ والأتمتة والتحقق، ثم الإطلاق والتحسين المستمر.",
    systemLabel: "DELIVERY SYSTEM / 08 STAGES",
  },
  framework: {
    eyebrow: "01 / DELIVERY SYSTEM",
    title: "ثماني مراحل. لكل مرحلة مدخلات وقرار ومخرجات.",
    body: "اختر مرحلة لترى ما تحتاج إليه، وما يحدث داخلها، والبوابة التي يجب أن تجتازها قبل الانتقال.",
    tablist: "مراحل منظومة التسليم",
    selected: "المرحلة المحددة",
    nextLabel: "المرحلة التالية",
    loopLabel: "العودة إلى الاكتشاف",
    loopHint: "أدلة جديدة",
    fields: fieldsAr,
  },
  stages: [
    {
      id: "discovery", number: "01", code: "DISCOVERY", title: "الاكتشاف",
      short: "فهم المشكلة الفعلية قبل اقتراح أي حل.",
      objective: "فهم مشكلة العمل، والأشخاص المتأثرين بها، والطريقة التي يسير بها العمل فعليًا اليوم — قبل تصميم أي حل.",
      inputs: ["أهداف أصحاب المصلحة ومتطلباتهم", "سير العمل الحالي ونقاط التسليم", "الأنظمة ومصادر البيانات القائمة", "قواعد العمل والقيود التشغيلية", "نقاط الألم لدى المستخدمين"],
      activities: ["تحديد هدف العمل ومعايير النجاح", "رسم المستخدمين والأدوار وسير العمل الحالي", "حصر الأنظمة ومصادر البيانات والتكاملات المطلوبة", "توثيق القيود والاعتبارات الأمنية والمخاطر الأولية"],
      automation: ["تحليل الأتمتة يبدأ من هنا", "المهام اليدوية المتكررة وإعادة إدخال البيانات", "نقاط التسليم والموافقات وتحديثات الحالة", "الإشعارات والجدولة ومزامنة البيانات", "تُسجَّل كلها فرصًا مرشّحة — لا وعودًا"],
      gate: { name: "فهم المشكلة", question: "هل نفهم المشكلة بما يكفي لتعريف النظام؟" },
      outputs: ["تعريف المشكلة", "خريطة المتطلبات", "خريطة سير العمل", "حصر التكاملات", "فرص الأتمتة", "سجل أولي للمخاطر"],
      quality: ["المشكلة مصاغة بلغة العمل، لا كقائمة ميزات", "معايير النجاح قابلة للملاحظة", "المجهول موثّق، لا مفترض"],
      next: "تتحول النتائج إلى خطة للنظام.",
    },
    {
      id: "strategy", number: "02", code: "STRATEGY", title: "الاستراتيجية",
      short: "تحويل النتائج إلى خطة نظام محددة النطاق.",
      objective: "تحويل نتائج الاكتشاف إلى خطة نظام محددة النطاق: ما الذي سيُبنى، وبأي ترتيب، وأين تقع حدوده.",
      inputs: ["مخرجات الاكتشاف", "أولويات العمل", "قيود الميزانية والجدول الزمني", "سجل المخاطر"],
      activities: ["تحديد النطاق والأولويات", "تحديد رحلات المستخدم وحدود النظام", "اختيار استراتيجية التكامل وتحديد ملكية البيانات", "فصل الإصدار الأول عن المراحل اللاحقة", "ترتيب المخاطر حسب أولويتها"],
      automation: ["رسم حدود الأتمتة: ما يعمل تلقائيًا وما يبقى يدويًا", "ترتيب الفرص حسب القيمة والتكرار والمخاطرة", "تحديد البيانات التي سيعتمد عليها كل مسار"],
      gate: { name: "اعتماد النطاق", question: "هل يحل النظام المقترح المشكلة التشغيلية الصحيحة بدرجة تعقيد مقبولة؟" },
      outputs: ["نطاق الحل", "خريطة النظام", "متطلبات مرتبة حسب الأولوية", "خطة الأتمتة", "مراحل التسليم", "التوجه المعماري"],
      quality: ["كل عنصر في النطاق يعود إلى حاجة مكتشفة", "الحدود بين الأنظمة صريحة", "ما هو خارج النطاق مكتوب بوضوح"],
      next: "تُصمَّم الخطة كتجربة وكسلوك للنظام.",
    },
    {
      id: "design", number: "03", code: "DESIGN", title: "التصميم",
      short: "تصميم التجربة وسلوك النظام معًا.",
      objective: "تحديد كيف يتنقل الناس داخل النظام وكيف يستجيب النظام في كل حالة — لا كيف تبدو الشاشات فحسب.",
      inputs: ["النطاق وخريطة النظام", "رحلات المستخدم", "الهوية والمحتوى", "متطلبات إمكانية الوصول"],
      activities: ["تصميم المسارات وحالات النظام قبل التفاصيل البصرية", "تحديد السلوك المتجاوب وسلوك الاتجاهين"],
      tracks: [
        { label: "تصميم التجربة", items: ["رحلات المستخدم", "معمارية المعلومات", "أنماط التفاعل", "السلوك المتجاوب", "إمكانية الوصول"] },
        { label: "تجربة النظام", items: ["الحالات", "الأخطاء", "التحميل", "الحالات الفارغة", "الصلاحيات", "التغذية الراجعة التشغيلية"] },
        { label: "نظام الواجهة", items: ["المكونات", "الطباعة", "المسافات", "التسلسل البصري", "سلوك RTL / LTR"] },
      ],
      automation: ["أنظمة مكونات قابلة لإعادة الاستخدام", "أنماط مبنية على رموز التصميم", "نماذج مبنية على المخططات", "أنماط حالات قابلة لإعادة الاستخدام", "المسار الآلي وبديله اليدوي يُصمَّمان معًا"],
      gate: { name: "تحديد الحالات", question: "هل التجربة وكل حالات النظام محددة بما يكفي للبناء؟" },
      outputs: ["رحلات المستخدم", "الإطارات الهيكلية", "مواصفات الواجهة", "الحالات المتجاوبة", "قواعد التفاعل", "متطلبات المكونات"],
      quality: ["لكل مسار حالات تحميل وفراغ وخطأ", "مسارات لوحة المفاتيح وقارئات الشاشة مأخوذة بالحسبان", "تخطيطا العربية والإنجليزية يُصمَّمان معًا، لا يُعكس أحدهما لاحقًا"],
      next: "تتحول المواصفات إلى شيفرة إنتاجية.",
    },
    {
      id: "engineering", number: "04", code: "ENGINEERING", title: "الهندسة",
      short: "بناء أسس قابلة للصيانة بحدود صريحة.",
      objective: "بناء المنتج على أسس آمنة وقابلة للاختبار والصيانة، مع حدود واضحة بين الواجهة والمنطق والبيانات والتكاملات.",
      principle: "نختار التقنيات بحسب المسؤولية، لا بحسب الرواج.",
      inputs: ["مواصفات الواجهة", "خريطة النظام والتوجه المعماري", "حصر التكاملات", "المتطلبات الأمنية"],
      activities: ["معمارية الواجهة الأمامية والأنظمة الخلفية", "حدود الواجهات البرمجية وعقودها", "نمذجة قاعدة البيانات", "المصادقة والتفويض", "التحقق من البيانات وإدارة الحالة ومعالجة الأخطاء", "التكاملات وإعدادات البيئات"],
      automation: ["بناء الواجهات البرمجية وهياكل البيانات وطبقة التكامل التي تعتمد عليها المسارات", "جعل مُطلِقات المسارات صريحة في نموذج البيانات", "إعداد البيئات بحيث تعمل المسارات بسلوك متسق"],
      gate: { name: "اكتمال الهندسة الأساسية", question: "هل اكتملت الهندسة الأساسية بحدود صحيحة ومسارات فشل معالَجة؟" },
      outputs: ["شيفرة إنتاجية", "عقود الواجهات البرمجية", "مخطط قاعدة البيانات", "طبقة التكامل", "المصادقة والتفويض", "الإعدادات", "التوثيق التقني"],
      quality: ["المسارات الأساسية تعمل من البداية إلى النهاية", "كل مدخل غير موثوق يُتحقق منه", "حدود الصلاحيات مطبّقة على الخادم", "مسارات الفشل تعيد أخطاء مضبوطة", "لا أسرار في شيفرة المتصفح"],
      next: "الأسس جاهزة لتنسيق مسارات العمل.",
    },
    {
      id: "automation", number: "05", code: "AUTOMATION", title: "الأتمتة",
      short: "تحويل العمليات المتكررة إلى مسارات قابلة للتحقق.",
      objective: "تحويل العمليات المتكررة والقواعد التشغيلية إلى مسارات قابلة للتنفيذ والتحقق والمراقبة.",
      inputs: ["خطة الأتمتة وحدودها", "الواجهات البرمجية وطبقة البيانات", "قواعد العمل", "نقاط الموافقة البشرية"],
      activities: ["تحديد مُطلِق كل مسار وسياقه وقراراته", "تنفيذ الإجراءات على الأنظمة الفعلية", "التحقق من النتائج بدل افتراض النجاح", "تصميم مسارات الفشل: إعادة المحاولة، البديل، التنبيه، التدخل البشري", "تسجيل حالة التنفيذ لإتاحة الرؤية التشغيلية"],
      automation: ["التنسيق عبر نموذج التنفيذ: حدث، سياق، قرار، إجراء، تحقق", "أدوات تُختار بحسب المسؤولية — محركات مسارات مثل n8n، أو Webhooks، أو واجهات برمجية مباشرة"],
      gate: { name: "التحقق من الأتمتة", question: "هل يتحقق كل مسار من نتيجته ويعالج الفشل بطريقة مضبوطة؟" },
      outputs: ["مسارات أتمتة", "اتصالات التكامل", "مسارات الفشل والتصعيد", "سجلات التنفيذ"],
      quality: ["إرسال الطلب لا يُعدّ نجاحًا", "تكرار الحدث لا ينتج إجراءً مكررًا", "الفشل يصل إلى الشخص المسؤول عندما يلزم"],
      next: "تدخل الميزات والمسارات مرحلة التحقق.",
    },
    {
      id: "testing", number: "06", code: "TESTING", title: "الاختبار",
      short: "التحقق من المسار الصحيح ومسارات الفشل وما بينهما.",
      objective: "التحقق من أن النظام يعمل بشكل صحيح — بما في ذلك عندما تتعطل الاعتماديات، أو تكون البيانات خاطئة، أو يتصرف المستخدم بشكل غير متوقع.",
      inputs: ["الميزات والمسارات المبنية", "معايير القبول", "المخاطر والحالات الطرفية المعروفة"],
      activities: ["وظيفي — هل تعمل كل ميزة كما ينبغي؟", "تكامل — هل تتواصل الأنظمة المترابطة بشكل صحيح؟", "مسارات الفشل — ماذا يحدث عند تعطل اعتمادية؟", "التجاوب — هل يعمل النظام عبر مقاسات الشاشات؟", "إمكانية الوصول — لوحة المفاتيح، الدلالات، تقليل الحركة", "الأداء — سلوك التحميل والتشغيل", "الانحدار — هل كسرت التغييرات الجديدة ما كان يعمل؟", "الأتمتة — هل تعالج المسارات الحالات المتوقعة وغير المتوقعة؟"],
      automation: ["اختبارات وحدات ومتصفح آلية حيث تضيف ثقة فعلية", "اختبار فروع كل مسار وحالات فشله", "فحوص الانحدار قبل كل إصدار"],
      gate: { name: "اجتياز اختبارات الانحدار", question: "هل تم التحقق من المسارات الحرجة وحالات فشلها — لا من المسار الصحيح وحده؟" },
      outputs: ["مسارات متحقق منها", "عيوب معالَجة", "تغطية اختبارات الانحدار", "حالة الجاهزية للإطلاق"],
      quality: ["لا إطلاق لمجرد أن المسار الصحيح يعمل", "العيوب تُعالَج أو تُقبل صراحةً", "الاختبارات تعكس الاستخدام الفعلي، لا البيانات المثالية وحدها"],
      next: "تنتقل النسخ المتحقق منها إلى إطلاق مضبوط.",
    },
    {
      id: "launch", number: "07", code: "LAUNCH", title: "الإطلاق",
      short: "الإطلاق إلى بيئة الإنتاج بشكل مضبوط.",
      objective: "نقل النظام إلى بيئة الإنتاج بطريقة مضبوطة، والتأكد من أن مساراته الأساسية تعمل في البيئة الفعلية.",
      inputs: ["نسخة جاهزة للإطلاق", "إعدادات الإنتاج", "خطة ترحيل البيانات", "النطاق وبيانات اعتماد التكاملات، محفوظة على الخادم"],
      activities: ["التحقق من إعدادات الإنتاج ومتغيرات البيئة", "تطبيق ترحيلات قاعدة البيانات", "النشر وإعداد النطاق", "التحقق من التكاملات في بيئة الإنتاج", "اختبارات سريعة للمسارات الأساسية", "معرفة طريقة التراجع قبل الحاجة إليها"],
      automation: ["التحقق من تنفيذ المسارات مع خدمات الإنتاج الفعلية", "تأكيد المُطلِقات وبيانات الاعتماد وWebhooks لكل بيئة", "مراقبة أولى عمليات التنفيذ عن قرب"],
      gate: { name: "التحقق من بيئة الإنتاج", question: "هل تم التحقق من المسارات الأساسية في بيئة الإنتاج؟" },
      outputs: ["نظام إنتاجي بمسارات أساسية متحقق منها", "إعدادات النشر", "دليل تشغيلي، حين يتطلب النطاق ذلك"],
      quality: ["البيئات تختلف حيث يُقصد ذلك فقط", "لا بيانات اختبار في بيئة الإنتاج", "المراقبة جاهزة قبل وصول الاستخدام الفعلي"],
      next: "يبدأ الاستخدام الفعلي في إنتاج الأدلة.",
    },
    {
      id: "evolution", number: "08", code: "EVOLUTION", title: "التطوير",
      short: "التحسين بناءً على الأدلة، ثم العودة إلى الاكتشاف.",
      objective: "تحسين النظام بناءً على طريقة استخدامه وتشغيله فعليًا — لا على الافتراضات.",
      inputs: ["ملاحظات الاستخدام", "المشكلات التشغيلية", "بيانات الأداء", "سجلات التنفيذ"],
      activities: ["مراجعة الموثوقية والأداء", "معالجة الدين التقني والتحديثات الأمنية", "تقييم متطلبات التوسع", "ترتيب أولويات تحسينات المنتج"],
      automation: ["اكتشاف فرص أتمتة جديدة من التشغيل الفعلي", "تحسين المسارات بناءً على أدلة التنفيذ", "إيقاف الأتمتة التي لم تعد تضيف قيمة"],
      gate: { name: "جمع أدلة التحسين", question: "هل توجد أدلة كافية تبرر التغيير التالي؟" },
      outputs: ["قائمة التحسينات", "متطلبات محدّثة", "مدخلات جديدة للاكتشاف"],
      quality: ["التغييرات مدفوعة بالأدلة", "التحديثات الأمنية لا تُؤجَّل إلى أجل غير مسمى", "كل تحسين يمر عبر البوابات نفسها"],
      next: "تعود الأدلة الجديدة إلى 01 الاكتشاف.",
    },
  ],
  automationByDesign: {
    eyebrow: "02 / AUTOMATION BY DESIGN",
    title: "الأتمتة ليست مرحلة أخيرة.",
    body: "نحدد فرص الأتمتة في الاكتشاف، ونرسم حدودها في الاستراتيجية، ونصمم حالاتها، ونبنيها على أسس هندسية — ثم نختبرها ونراقبها في بيئة الإنتاج. المرحلة 05 هي حيث تُنفَّذ المسارات وتُنسَّق بعمق؛ أما التفكير في الأتمتة فيبدأ قبلها بكثير.",
    rows: ["تحديد الاحتكاك اليدوي", "رسم حدود الأتمتة", "تصميم الحالات الآلية واليدوية", "بناء أسس الواجهات البرمجية والبيانات والتكامل", "تنسيق مسارات العمل", "التحقق من الفروع وحالات الفشل", "التحقق من التنفيذ في بيئة الإنتاج", "التحسين بناءً على أدلة التشغيل الفعلية"],
    phases: ["الأساس", "التنسيق", "التحقق", "التشغيل", "التعلّم"],
  },
  executionModel: {
    eyebrow: "03 / EXECUTION MODEL",
    title: "كل مسار آلي يجيب عن الأسئلة السبعة نفسها.",
    body: "الأتمتة ليست ربط واجهة برمجية بأخرى. إنها سلسلة قرارات قابلة للتحقق، لكل خطوة فيها مسؤولية واحدة واضحة.",
    nodes: [
      { code: "EVENT", label: "حدث", question: "ما الذي يُطلق المسار؟", examples: ["رسالة عميل", "إرسال نموذج", "طلب حجز", "تحديث سجل", "موعد مجدول", "Webhook", "تغيّر حالة"] },
      { code: "CONTEXT", label: "سياق", question: "ما الذي يحتاج إلى معرفته؟", examples: ["العميل", "الحجز", "الحالة الحالية", "التوفر", "الصلاحيات", "الإجراءات السابقة"] },
      { code: "DECISION", label: "قرار", question: "ما الذي يجب أن يُقرَّر؟", examples: ["طلب صالح؟", "مكرر؟", "متاح؟", "مصرّح؟", "أي فرع؟", "إعادة أم توقف؟"] },
      { code: "ACTION", label: "إجراء", question: "ما الذي يحدث تلقائيًا؟", examples: ["طلب API", "تحديث قاعدة البيانات", "تحديث التقويم", "إسناد مهمة", "إنشاء مستند", "انتقال حالة"] },
      { code: "VERIFY", label: "تحقق", question: "هل نجح فعلًا؟", examples: ["التحقق من الاستجابة", "تأكيد قاعدة البيانات", "رد النظام الخارجي", "فحص الحالة"], note: "إرسال الطلب لا يعني نجاحه." },
      { code: "RECORD", label: "تسجيل", question: "ما الذي سنتمكن من رؤيته لاحقًا؟", examples: ["حالة التنفيذ", "السجلات", "التوقيتات", "الأخطاء"] },
      { code: "NOTIFY", label: "إشعار", question: "من يحتاج إلى أن يعرف؟", examples: ["تأكيد للعميل", "تحديث للفريق", "تنبيه للمشغّل"] },
    ],
    failure: {
      code: "FAILURE PATH", label: "مسار الفشل", question: "ماذا يحدث عندما يفشل التحقق؟", from: "من التحقق",
      options: [{ code: "RETRY", label: "إعادة المحاولة" }, { code: "FALLBACK", label: "بديل مضبوط" }, { code: "ERROR", label: "حالة خطأ واضحة" }, { code: "ALERT", label: "تنبيه تشغيلي" }, { code: "HUMAN", label: "تدخل بشري" }],
    },
    note: "هذا منهج عمل، لا قائمة تُطبَّق كاملةً على كل مشروع. نختار الآليات بحسب أهمية كل مسار ومخاطره.",
    demo: {
      model: "نموذج توضيحي · غير متصل بنظام فعلي",
      runSuccess: "تشغيل: مسار ناجح", runFailure: "تشغيل: فشل التحقق", pause: "إيقاف مؤقت",
      success: [
        "يصل طلب حجز.",
        "تُحمَّل بيانات العميل والموعد المطلوب وحالة الحجز الحالية.",
        "الطلب صالح والموعد متاح: الانتقال إلى التعيين.",
        "يُكتب الموعد في التقويم ويُعيَّن أخصائي.",
        "يؤكد التقويم وقاعدة البيانات الحجز معًا.",
        "تُحفظ حالة التنفيذ والتوقيتات والنتيجة.",
        "يتلقى العميل التأكيد، ويرى الفريق الحجز الجديد.",
      ],
      failure: {
        verify: "لم يُرجع التقويم أي تأكيد. إرسال الطلب لا يعني نجاحه.",
        retry: "إعادة محاولة واحدة مضبوطة. ما زال غير مؤكد.",
        handoff: "يبقى الحجز معلّقًا ويُنبَّه أحد المشغّلين لمعالجته.",
        record: "يُسجَّل الفشل وإعادة المحاولة وتسليم الحالة للفريق.",
        notify: "يُبلَّغ العميل بأن الحجز قيد التأكيد، ويُنبَّه الفريق.",
      },
    },
  },
  artifacts: {
    eyebrow: "04 / DELIVERY ARTIFACTS",
    title: "نسلّم نظامًا مُهندسًا، لا مجموعة شاشات.",
    body: "بحسب نطاق المشروع، ينتج المسار بعض هذه المخرجات أو جميعها. كلٌّ منها يوثّق قرارًا يمكن الرجوع إليه لاحقًا.",
    items: [
      { title: "خريطة المتطلبات", stages: "01" }, { title: "رحلات المستخدم", stages: "03" }, { title: "معمارية النظام", stages: "02 · 04" },
      { title: "نموذج البيانات", stages: "04" }, { title: "عقود الواجهات البرمجية", stages: "04" }, { title: "نظام الواجهة", stages: "03" },
      { title: "مسارات الأتمتة", stages: "05" }, { title: "تغطية الاختبارات", stages: "06" }, { title: "إعدادات النشر", stages: "07" },
      { title: "التوثيق التقني", stages: "04–08" }, { title: "الدليل التشغيلي", stages: "07" },
    ],
  },
  responsibility: {
    eyebrow: "05 / RESPONSIBILITY",
    title: "أربع مسؤوليات. نظام واحد.",
    columns: [
      { code: "DESIGN", title: "ما نصممه", items: ["تجربة المستخدم", "سلوك النظام", "تدفقات البيانات", "الحالات التشغيلية"] },
      { code: "ENGINEER", title: "ما نهندسه", items: ["الواجهات الأمامية", "الأنظمة الخلفية", "الواجهات البرمجية", "قواعد البيانات", "المصادقة", "التكاملات"] },
      { code: "AUTOMATE", title: "ما نؤتمته", items: ["انتقالات مسارات العمل", "الإشعارات", "الجدولة", "المزامنة", "الإجراءات التشغيلية المتكررة"] },
      { code: "VERIFY", title: "ما نتحقق منه", items: ["الوظائف", "التكاملات", "حالات الفشل", "الأداء", "الحدود الأمنية", "السلوك المتجاوب"] },
    ],
  },
  gates: {
    eyebrow: "06 / SYSTEM GATES",
    title: "لا تنتقل مرحلة قبل أن تجتاز بوابتها.",
    body: "البوابة ليست اجتماعًا رسميًا، بل سؤال هندسي واضح يجب أن تكون إجابته «نعم» قبل مواصلة العمل.",
    signalsLabel: "QUALITY SIGNALS",
    signalsBody: "نصف الجودة بما يمكن التحقق منه — لا بأرقام مصطنعة.",
    signals: ["مسارات حرجة مُختبرة", "حدود نظام صريحة", "تكاملات موثّقة", "مسارات واعية بالفشل", "واجهات متجاوبة", "تفاعلات قابلة للوصول", "إعدادات إنتاج مضبوطة"],
  },
  boundary: {
    eyebrow: "07 / HUMAN + AUTOMATION",
    title: "لا نؤتمت القرار لمجرد أن أتمتته ممكنة.",
    body: "في كل مسار نحدد أين تنتهي الأتمتة ويبدأ الحكم البشري.",
    rows: [
      { code: "AUTO", title: "ما الذي يجب أن يعمل تلقائيًا", body: "الخطوات المتكررة المبنية على قواعد، ذات النتائج القابلة للتحقق." },
      { code: "APPROVE", title: "ما الذي يحتاج إلى موافقة بشرية", body: "القرارات ذات الأثر المالي أو التعاقدي أو على العميل." },
      { code: "VISIBLE", title: "ما الذي يتطلب رؤية تشغيلية", body: "الخطوات التي يجب أن يتمكن الفريق من رؤيتها ومراجعتها وتفسيرها." },
      { code: "HOLD", title: "عندما تكون البيانات أو الثقة غير كافية", body: "يتوقف المسار ويُسلّم الأمر لشخص مسؤول بدل التخمين." },
      { code: "UNDO", title: "ما الذي يجب أن يبقى قابلًا للتراجع", body: "الإجراءات التي يجب أن تبقى قابلة للتصحيح دون فقدان البيانات." },
    ],
  },
  failureFirst: {
    eyebrow: "08 / FAILURE-FIRST ENGINEERING",
    title: "نصمم للمسار الصحيح، ولما يحدث عندما لا يسير كل شيء كما هو متوقع.",
    body: "في كل مسار حرج نسأل: كيف يتصرف النظام عندما يتعطل أحد أجزائه؟ هذه فلسفة هندسية؛ ونطبّق آلياتها بحسب أهمية كل مسار ومخاطره.",
    conditions: [
      { code: "UNAVAILABLE", label: "واجهات برمجية غير متاحة" }, { code: "INVALID", label: "بيانات غير صالحة" }, { code: "DUPLICATE", label: "إجراءات مكررة" },
      { code: "TIMEOUT", label: "انتهاء المهلة" }, { code: "MISSING", label: "حالة مفقودة" }, { code: "FORBIDDEN", label: "فشل الصلاحيات" }, { code: "DOWNTIME", label: "توقف خدمات الطرف الثالث" },
    ],
  },
  security: {
    eyebrow: "SECURITY BY DESIGN",
    title: "الأمان قرار معماري، لا طبقة لاحقة.",
    body: "مبادئ نبني بها منذ السطر الأول من الشيفرة.",
    principles: ["الأسرار تبقى على الخادم", "التحقق من كل مدخل غير موثوق", "الحد الأدنى من الصلاحيات اللازمة", "حدود تفويض صريحة", "تعامل آمن مع البيانات", "وصول مضبوط إلى التكاملات"],
  },
  loop: {
    eyebrow: "09 / FEEDBACK LOOP",
    title: "الإطلاق ليس النهاية. الأدلة تعيد المسار إلى بدايته.",
    body: "تغذّي المرحلة 08 المرحلةَ 01 بأدلة جديدة من الاستخدام والتشغيل الفعليين، فيمر كل تحسين عبر البوابات نفسها.",
    evidenceLabel: "EVIDENCE SOURCES",
    evidence: ["ملاحظات الاستخدام", "المشكلات التشغيلية", "الأداء", "فرص الأتمتة", "الموثوقية", "الدين التقني", "التحديثات الأمنية", "متطلبات التوسع"],
    arcLabel: "NEW EVIDENCE",
    center: "DELIVERY / LOOP",
    stagesLabel: "مراحل حلقة التطوير",
    controls: { run: "شغّل الحلقة", replay: "أعد التشغيل", pause: "إيقاف مؤقت" },
  },
  cta: {
    eyebrow: "10 / NEXT MOVE",
    title: "لنَبْنِ النظام الذي يحتاجه عملك الآن.",
    body: "إذا كانت لديك عملية يدوية، أو أنظمة منفصلة، أو منتج يحتاج إلى هندسة أو أتمتة، نبدأ بفهم العملية قبل كتابة أول سطر من الحل.",
    button: "ابدأ مشروعك",
  },
};

export function getProcessContent(locale: Locale): ProcessContent {
  return locale === "ar" ? processArabic : processEnglish;
}
