import type { Locale } from "@/lib/i18n/config";

// Structured Relax Moon case-study content. Every behaviour described here is one the
// repository models (interactive booking demo, operations demo rules, architecture
// data, case-study copy); nothing adds business rules, metrics or private details.
export type AutomationMode = "automated" | "assisted" | "manual";
export type JourneyDetail = { input: string; action: string; decision?: string; data: string; next: string };

type RelaxMoonCopy = {
  positioning: string;
  modelNote: string;
  challenge: { label: string; title: string; intro: string; variables: [string, string][] };
  responsibilities: { label: string; title: string; intro: string; legend: Record<AutomationMode, [string, string]>; items: { title: string; body: string; mode: AutomationMode }[] };
  journey: { detailLabels: { input: string; action: string; decision: string; data: string; next: string }; details: JourneyDetail[] };
  decisions: { label: string; title: string; intro: string; items: [string, string][]; lifecycleTitle: string; lifecycleIntro: string; states: { name: string; note: string; final?: boolean }[]; transitions: string[]; change: string };
  boundaries: { title: string; intro: string; items: [string, string, string][] };
  technologies: { label: string; title: string; intro: string; fields: { layer: string; responsibility: string; handles: string; connects: string }; items: { name: string; layer: string; responsibility: string; handles: string; connects: string }[] };
  guardrails: { title: string; intro: string; items: [string, string][]; scope: string };
  operations: { label: string; title: string; represents: string; exploreTitle: string; explore: string[]; note: string };
  outcomes: { label: string; title: string; items: string[]; note: string };
  cta: string;
};

export const relaxMoon: Record<Locale, RelaxMoonCopy> = {
  en: {
    positioning: "Conversational booking & operations automation",
    modelNote: "Stage details describe the booking workflow as modelled in this sanitized demonstration. Credentials, endpoints, customer data and private business rules are excluded.",
    challenge: {
      label: "WHAT HAS TO BE COORDINATED",
      title: "Every booking is a coordination problem.",
      intro: "A mobile spa booking combines a conversation, a treatment, a time, a place and a specialist across two branches. Each answer constrains the next.",
      variables: [
        ["Conversation", "Requests arrive as WhatsApp messages, in the customer's own words."],
        ["Service", "Each treatment has its own duration, which shapes how long a specialist is committed."],
        ["Date & time", "The requested slot has to fit the schedule, not only the calendar day."],
        ["Location", "Sessions take place at the customer's home or hotel, so the place is part of the booking."],
        ["Branch", "Riyadh and Al Sharqiyah operate separate specialist teams."],
        ["Specialist", "Only a specialist in the right branch, without an overlapping booking, can take it."],
        ["Changes", "Customers ask to move or cancel appointments after they are confirmed."],
        ["Records", "Operations need one consistent record of every booking and what happened to it."],
      ],
    },
    responsibilities: {
      label: "SYSTEM RESPONSIBILITIES",
      title: "What the system is responsible for.",
      intro: "Responsibilities, not features. Each one states who acts: the workflow alone, the workflow with staff, or staff.",
      legend: {
        automated: ["Automated", "Runs without staff action."],
        assisted: ["Assisted", "The system narrows the options; staff decide."],
        manual: ["Manual", "Staff handle the case."],
      },
      items: [
        { title: "Conversation", body: "Receive the customer's message and route it to booking, change or cancellation.", mode: "automated" },
        { title: "Service", body: "Capture the requested treatment from the services on offer.", mode: "automated" },
        { title: "Schedule", body: "Collect the date and a time from the slots open for booking.", mode: "automated" },
        { title: "Location", body: "Record whether the session is at home or a hotel, and where.", mode: "automated" },
        { title: "Availability", body: "Check the requested slot and the specialists able to take it.", mode: "automated" },
        { title: "Assignment", body: "Associate the booking with an eligible specialist. In the operations console, staff assign from a list the system has already filtered.", mode: "assisted" },
        { title: "Records & schedule", body: "Store the booking and represent it on the schedule.", mode: "automated" },
        { title: "Confirmation", body: "Return the confirmation to the customer and keep operations informed.", mode: "automated" },
        { title: "Lifecycle", body: "Staff confirm, complete or cancel bookings; the system accepts only valid status changes.", mode: "assisted" },
        { title: "Exceptions", body: "Cancellations inside the final hour, and anything outside policy, are referred to customer service.", mode: "manual" },
      ],
    },
    journey: {
      detailLabels: { input: "Input", action: "System action", decision: "Decision", data: "Data", next: "Next" },
      details: [
        { input: "The customer's first WhatsApp message.", action: "Greets the customer and offers three paths: book, change or cancel.", decision: "Which path the customer chooses.", data: "A conversation session opens.", next: "Booking continues to service selection; changes and cancellations look up the existing booking." },
        { input: "The chosen treatment.", action: "Presents the services on offer as choices instead of free text.", decision: "Only an offered service can be selected.", data: "The session records the service.", next: "Date selection." },
        { input: "The requested day.", action: "Offers today, tomorrow or another date.", data: "The session records the date.", next: "Time selection." },
        { input: "The requested time.", action: "Offers the slots open for booking on that day.", decision: "The request continues only with an offered slot.", data: "The session records the time.", next: "Location." },
        { input: "Home or hotel, and the location details.", action: "Records where the session takes place, then asks for any specialist preference.", data: "The session records the location type, location and preference.", next: "Availability check." },
        { input: "Service, date, time and location.", action: "Checks the requested slot against the schedule and the specialists who could take it.", decision: "Continue only when the slot is free and at least one specialist is eligible.", data: "Nothing is written yet; the request is still a session.", next: "Specialist assignment." },
        { input: "The specialists eligible for the slot.", action: "Associates the booking with one of them.", decision: "Eligible means the booking's branch and no overlapping active booking at that time.", data: "The booking record is prepared with the assigned specialist.", next: "Confirmation." },
        { input: "The complete booking record.", action: "Writes the record, reflects it on the schedule and sends the confirmation.", data: "The booking is stored as an active booking and the schedule is updated.", next: "The customer receives the confirmation; operations see the new booking." },
      ],
    },
    decisions: {
      label: "DECISION LOGIC",
      title: "Decisions, not just API calls.",
      intro: "Before the conversation moves on, a rule is applied. These are the rules this demonstration models.",
      items: [
        ["What does the customer want?", "Book, change or cancel. Each opens its own path."],
        ["Is the request complete?", "Service, date, time and location are collected before availability is checked."],
        ["Is the slot open?", "The requested time must be one of the slots offered for that day."],
        ["Who can take it?", "A specialist in the booking's branch with no overlapping active booking."],
        ["Can it be cancelled?", "Only while more than one hour remains. Otherwise the customer is referred to customer service."],
        ["Is the status change valid?", "Pending can become confirmed or cancelled; confirmed can become completed or cancelled."],
      ],
      lifecycleTitle: "Booking lifecycle",
      lifecycleIntro: "A booking has four states. Completed and cancelled are final.",
      states: [
        { name: "Pending", note: "Created from the conversation, awaiting confirmation." },
        { name: "Confirmed", note: "Scheduled with an assigned specialist." },
        { name: "Completed", note: "The session took place.", final: true },
        { name: "Cancelled", note: "Cancelled within policy, before completion.", final: true },
      ],
      transitions: ["Pending → Confirmed", "Pending → Cancelled", "Confirmed → Completed", "Confirmed → Cancelled"],
      change: "A change request moves a confirmed appointment to a new date and time; the booking stays active.",
    },
    boundaries: {
      title: "What crosses each boundary",
      intro: "Each layer receives only what it needs.",
      items: [
        ["Customer", "WhatsApp", "Messages and selections: service, time and location."],
        ["WhatsApp Cloud API", "Orchestration", "Inbound message events; outbound replies and confirmations."],
        ["Orchestration", "Booking logic", "The collected booking request."],
        ["Booking logic", "Calendar & database", "Availability reads; the booking record and its schedule entry."],
        ["Orchestration", "Operations", "Notice of new and changed bookings."],
      ],
    },
    technologies: {
      label: "TECHNOLOGY RESPONSIBILITIES",
      title: "Why each technology is there.",
      intro: "Each technology owns one layer, handles defined data and talks to named neighbours.",
      fields: { layer: "Layer", responsibility: "Responsibility", handles: "Handles", connects: "Talks to" },
      items: [
        { name: "n8n", layer: "Orchestration", responsibility: "Runs the booking workflow: moves the conversation between steps, applies the booking logic, calls the integrations and sends the responses.", handles: "Conversation state and booking requests", connects: "WhatsApp Cloud API, database, calendar" },
        { name: "Meta WhatsApp Cloud API", layer: "Channel", responsibility: "The customer-facing interface. Receives messages and delivers replies, booking options and confirmations.", handles: "Messages", connects: "n8n" },
        { name: "Supabase", layer: "Data", responsibility: "Keeps the structured operational records the workflow reads and writes.", handles: "Booking records and their status", connects: "n8n" },
        { name: "Google Calendar", layer: "Scheduling", responsibility: "Represents appointments on a schedule, so availability can be read and bookings stay visible.", handles: "Appointment times", connects: "n8n" },
      ],
    },
    guardrails: {
      title: "Guardrails",
      intro: "How the modelled workflow keeps bookings valid.",
      items: [
        ["Guided input", "Customers choose from offered services and slots, so the workflow receives values it can act on."],
        ["Eligibility before assignment", "A specialist is offered only when branch and schedule allow it."],
        ["Valid transitions only", "Status changes outside the lifecycle are rejected."],
        ["Policy-bound cancellation", "Late cancellations are handed to people instead of being forced through."],
        ["Server-side boundaries", "Processing and credentials stay server-side; this case study shows sanitized structure only."],
      ],
      scope: "The production workflow's error branches are not reproduced in this public demonstration.",
    },
    operations: {
      label: "OPERATIONAL INTERFACE",
      title: "The view staff work from.",
      represents: "The automation creates bookings; operations need to see and manage them. The console below represents the commercial operations interface built on top of the workflow.",
      exploreTitle: "What you can explore",
      explore: ["Bookings by status and branch", "Specialist assignment from eligible staff", "Booking details and status changes", "Team availability", "Customer history", "The activity timeline", "Analytics by status"],
      note: "It runs entirely in your browser with fictional data. Nothing is sent or stored.",
    },
    outcomes: {
      label: "CAPABILITIES",
      title: "What the system gives the operation.",
      items: [
        "Bookings taken through the channel customers already use.",
        "Every booking checked against branch, schedule and specialist availability before it is confirmed.",
        "One record per booking, with its status history.",
        "Changes and cancellations handled inside policy.",
        "Operations kept informed of new and changed bookings.",
      ],
      note: "Outcomes are described as capabilities; no performance figures are published for this project.",
    },
    cta: "Have a booking or operations process that still runs by hand?",
  },
  ar: {
    positioning: "منظومة حجز وتشغيل مؤتمتة عبر واتساب",
    modelNote: "تصف تفاصيل المراحل مسار الحجز كما تجسّده هذه النسخة التوضيحية المنقّحة، دون بيانات الاعتماد أو عناوين الربط أو بيانات العملاء أو قواعد العمل الخاصة.",
    challenge: {
      label: "ما يجب تنسيقه",
      title: "كل حجز مسألة تنسيق.",
      intro: "يجمع حجز خدمة السبا المتنقلة بين محادثة وخدمة وموعد ومكان وأخصائي عبر فرعين، وكل إجابة تحدّ من الخيارات التالية.",
      variables: [
        ["المحادثة", "تصل الطلبات رسائلَ عبر واتساب، وبلغة العميل نفسه."],
        ["الخدمة", "لكل جلسة مدتها الخاصة، وهي تحدد وقت انشغال الأخصائي."],
        ["التاريخ والوقت", "يجب أن يتسع الجدول للموعد المطلوب، لا اليوم وحده."],
        ["الموقع", "تُقدَّم الجلسات في منزل العميل أو فندقه، فالمكان جزء من الحجز."],
        ["الفرع", "لكلٍّ من الرياض والمنطقة الشرقية فريق أخصائيين مستقل."],
        ["الأخصائي", "لا يتولى الحجز إلا أخصائي من الفرع نفسه ليس لديه حجز متداخل."],
        ["التعديلات", "يطلب العملاء تغيير الموعد أو إلغاءه بعد تأكيده."],
        ["السجلات", "يحتاج فريق التشغيل إلى سجل واحد متسق لكل حجز وما جرى عليه."],
      ],
    },
    responsibilities: {
      label: "مسؤوليات النظام",
      title: "ما الذي يتولاه النظام.",
      intro: "مسؤوليات لا مزايا. يوضّح كل بند من ينفّذه: مسار العمل وحده، أو بالتعاون مع الفريق، أو الفريق.",
      legend: {
        automated: ["مؤتمت", "يُنفَّذ دون تدخل من الفريق."],
        assisted: ["بمساندة النظام", "يضيّق النظام الخيارات، ويقرر الفريق."],
        manual: ["يدوي", "يتولى الفريق الحالة."],
      },
      items: [
        { title: "المحادثة", body: "استقبال رسالة العميل وتوجيهها إلى الحجز أو التعديل أو الإلغاء.", mode: "automated" },
        { title: "الخدمة", body: "تسجيل الجلسة المطلوبة من بين الخدمات المتاحة.", mode: "automated" },
        { title: "الموعد", body: "جمع التاريخ ووقت من الأوقات المتاحة للحجز.", mode: "automated" },
        { title: "الموقع", body: "تحديد ما إذا كانت الجلسة في المنزل أو الفندق، وأين.", mode: "automated" },
        { title: "التوفر", body: "التحقق من الموعد المطلوب ومن الأخصائيين القادرين على تغطيته.", mode: "automated" },
        { title: "التعيين", body: "ربط الحجز بأخصائي مؤهل. في لوحة التشغيل يختار الفريق من قائمة صفّاها النظام مسبقًا.", mode: "assisted" },
        { title: "السجلات والجدول", body: "حفظ الحجز وتمثيله في جدول المواعيد.", mode: "automated" },
        { title: "التأكيد", body: "إرسال التأكيد إلى العميل وإبقاء فريق التشغيل على اطلاع.", mode: "automated" },
        { title: "دورة الحجز", body: "يؤكد الفريق الحجوزات أو يكملها أو يلغيها، ولا يقبل النظام إلا الانتقالات الصحيحة.", mode: "assisted" },
        { title: "الاستثناءات", body: "يُحال الإلغاء في الساعة الأخيرة، وكل ما يخرج عن السياسة، إلى خدمة العملاء.", mode: "manual" },
      ],
    },
    journey: {
      detailLabels: { input: "المدخلات", action: "إجراء النظام", decision: "القرار", data: "البيانات", next: "التالي" },
      details: [
        { input: "أول رسالة يرسلها العميل عبر واتساب.", action: "يرحّب بالعميل ويعرض ثلاثة مسارات: الحجز أو تغيير الموعد أو الإلغاء.", decision: "المسار الذي يختاره العميل.", data: "تُفتح جلسة محادثة.", next: "يتابع الحجز إلى اختيار الخدمة، ويبحث التعديل والإلغاء عن الحجز القائم." },
        { input: "الجلسة المختارة.", action: "يعرض الخدمات المتاحة خيارات جاهزة بدل النص الحر.", decision: "لا يمكن اختيار إلا خدمة متاحة.", data: "تسجّل الجلسة الخدمة المختارة.", next: "اختيار التاريخ." },
        { input: "اليوم المطلوب.", action: "يعرض اليوم أو الغد أو تاريخًا آخر.", data: "تسجّل الجلسة التاريخ.", next: "اختيار الوقت." },
        { input: "الوقت المطلوب.", action: "يعرض الأوقات المتاحة للحجز في ذلك اليوم.", decision: "لا يستمر الطلب إلا بوقت من الأوقات المعروضة.", data: "تسجّل الجلسة الوقت.", next: "الموقع." },
        { input: "المنزل أو الفندق، وتفاصيل الموقع.", action: "يسجّل مكان الجلسة، ثم يسأل عن تفضيل الأخصائي إن وُجد.", data: "تسجّل الجلسة نوع الموقع والموقع والتفضيل.", next: "فحص التوفر." },
        { input: "الخدمة والتاريخ والوقت والموقع.", action: "يطابق الموعد المطلوب مع الجدول ومع الأخصائيين الذين يمكنهم تغطيته.", decision: "المتابعة فقط إذا كان الموعد شاغرًا ويوجد أخصائي مؤهل واحد على الأقل.", data: "لم يُكتب شيء بعد؛ ما زال الطلب ضمن الجلسة.", next: "تعيين الأخصائي." },
        { input: "الأخصائيون المؤهلون لهذا الموعد.", action: "يربط الحجز بأحدهم.", decision: "المؤهل: من فرع الحجز نفسه، وليس لديه حجز نشط متداخل في ذلك الوقت.", data: "يُجهَّز سجل الحجز مع الأخصائي المعيَّن.", next: "التأكيد." },
        { input: "سجل الحجز المكتمل.", action: "يحفظ السجل، ويعكسه في جدول المواعيد، ويرسل التأكيد.", data: "يُحفظ الحجز حجزًا نشطًا ويُحدَّث الجدول.", next: "يتلقى العميل التأكيد، ويرى فريق التشغيل الحجز الجديد." },
      ],
    },
    decisions: {
      label: "منطق القرار",
      title: "قرارات، لا مجرد استدعاءات API.",
      intro: "قبل أن تنتقل المحادثة إلى الخطوة التالية تُطبَّق قاعدة. هذه القواعد التي تجسّدها النسخة التوضيحية.",
      items: [
        ["ماذا يريد العميل؟", "حجزًا أو تغيير موعد أو إلغاءً، ولكلٍّ مساره الخاص."],
        ["هل اكتمل الطلب؟", "تُجمع الخدمة والتاريخ والوقت والموقع قبل فحص التوفر."],
        ["هل الموعد متاح؟", "يجب أن يكون الوقت المطلوب أحد الأوقات المعروضة لذلك اليوم."],
        ["من يمكنه تولّي الحجز؟", "أخصائي من فرع الحجز ليس لديه حجز نشط متداخل."],
        ["هل يمكن الإلغاء؟", "فقط إذا بقيت أكثر من ساعة على الموعد، وإلا يُحال العميل إلى خدمة العملاء."],
        ["هل تغيير الحالة صحيح؟", "من «قيد الانتظار» إلى «مؤكد» أو «ملغى»، ومن «مؤكد» إلى «مكتمل» أو «ملغى»."],
      ],
      lifecycleTitle: "دورة حياة الحجز",
      lifecycleIntro: "للحجز أربع حالات، و«مكتمل» و«ملغى» حالتان نهائيتان.",
      states: [
        { name: "قيد الانتظار", note: "أُنشئ من المحادثة وينتظر التأكيد." },
        { name: "مؤكد", note: "مجدول ومعيَّن له أخصائي." },
        { name: "مكتمل", note: "تمت الجلسة.", final: true },
        { name: "ملغى", note: "أُلغي وفق السياسة قبل اكتماله.", final: true },
      ],
      transitions: ["قيد الانتظار ← مؤكد", "قيد الانتظار ← ملغى", "مؤكد ← مكتمل", "مؤكد ← ملغى"],
      change: "ينقل طلب التعديل الموعد المؤكد إلى تاريخ ووقت جديدين، ويبقى الحجز نشطًا.",
    },
    boundaries: {
      title: "ما الذي يعبر كل حدّ",
      intro: "لا تتلقى كل طبقة إلا ما تحتاجه.",
      items: [
        ["العميل", "واتساب", "الرسائل والاختيارات: الخدمة والوقت والموقع."],
        ["WhatsApp Cloud API", "التنسيق", "أحداث الرسائل الواردة، والردود والتأكيدات الصادرة."],
        ["التنسيق", "منطق الحجز", "طلب الحجز بعد اكتمال بياناته."],
        ["منطق الحجز", "التقويم وقاعدة البيانات", "قراءات التوفر، وسجل الحجز وموعده في الجدول."],
        ["التنسيق", "فريق التشغيل", "إشعارات بالحجوزات الجديدة والمعدّلة."],
      ],
    },
    technologies: {
      label: "مسؤوليات التقنيات",
      title: "لماذا توجد كل تقنية.",
      intro: "تتولى كل تقنية طبقة واحدة، وتتعامل مع بيانات محددة، وتتصل بأطراف معروفة.",
      fields: { layer: "الطبقة", responsibility: "المسؤولية", handles: "البيانات", connects: "تتصل بـ" },
      items: [
        { name: "n8n", layer: "تنسيق مسارات العمل", responsibility: "يدير مسار الحجز: ينقل المحادثة بين الخطوات، ويطبّق منطق الحجز، ويستدعي التكاملات، ويرسل الردود.", handles: "حالة المحادثة وطلبات الحجز", connects: "WhatsApp Cloud API وقاعدة البيانات والتقويم" },
        { name: "Meta WhatsApp Cloud API", layer: "قناة المحادثة", responsibility: "واجهة العميل: يستقبل الرسائل ويوصل الردود وخيارات الحجز والتأكيدات.", handles: "الرسائل", connects: "n8n" },
        { name: "Supabase", layer: "البيانات", responsibility: "يحفظ السجلات التشغيلية المنظمة التي يقرؤها مسار العمل ويكتبها.", handles: "سجلات الحجز وحالاتها", connects: "n8n" },
        { name: "Google Calendar", layer: "الجدولة", responsibility: "يمثّل المواعيد في جدول، ليمكن قراءة التوفر وتبقى الحجوزات ظاهرة.", handles: "أوقات المواعيد", connects: "n8n" },
      ],
    },
    guardrails: {
      title: "ضوابط التشغيل",
      intro: "كيف يحافظ مسار العمل المُجسَّد على صحة الحجوزات.",
      items: [
        ["مدخلات موجّهة", "يختار العميل من خدمات وأوقات معروضة، فيتلقى مسار العمل قيمًا قابلة للتنفيذ."],
        ["الأهلية قبل التعيين", "لا يُعرض أخصائي إلا إذا سمح الفرع والجدول بذلك."],
        ["انتقالات صحيحة فقط", "يُرفض أي تغيير حالة خارج دورة الحجز."],
        ["إلغاء وفق السياسة", "يُحال الإلغاء المتأخر إلى الفريق بدل تمريره قسرًا."],
        ["حدود على الخادم", "تبقى المعالجة وبيانات الاعتماد على الخادم؛ ولا تعرض هذه الدراسة إلا بنية منقّحة."],
      ],
      scope: "لا تعيد هذه النسخة العامة إنتاج مسارات الأخطاء في مسار العمل الفعلي.",
    },
    operations: {
      label: "واجهة التشغيل",
      title: "الواجهة التي يعمل منها الفريق.",
      represents: "تنشئ الأتمتة الحجوزات، ويحتاج فريق التشغيل إلى رؤيتها وإدارتها. تمثّل اللوحة أدناه واجهة التشغيل التجارية المبنية فوق مسار العمل.",
      exploreTitle: "ما يمكنك استكشافه",
      explore: ["الحجوزات حسب الحالة والفرع", "تعيين الأخصائي من بين المؤهلين", "تفاصيل الحجز وتغيير حالته", "توفر الفريق", "سجل العملاء", "الخط الزمني للنشاط", "التحليلات حسب الحالة"],
      note: "تعمل بالكامل داخل متصفحك وببيانات خيالية، ولا يُرسل أو يُحفظ أي شيء.",
    },
    outcomes: {
      label: "القدرات",
      title: "ما الذي يقدّمه النظام للتشغيل.",
      items: [
        "حجوزات عبر القناة التي يستخدمها العملاء بالفعل.",
        "مطابقة كل حجز مع الفرع والجدول وتوفر الأخصائي قبل تأكيده.",
        "سجل واحد لكل حجز مع تاريخ حالاته.",
        "معالجة التعديلات والإلغاءات ضمن السياسة.",
        "إبقاء فريق التشغيل على اطلاع بالحجوزات الجديدة والمعدّلة.",
      ],
      note: "تُعرض النتائج قدراتٍ تشغيلية، ولا تُنشر أرقام أداء لهذا المشروع.",
    },
    cta: "لديك عملية حجز أو تشغيل ما زالت تُدار يدويًا؟",
  },
};
