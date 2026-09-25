import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  secret = process.env.SUPABASE_SECRET_KEY;
const anon = createClient(url, key, { auth: { persistSession: false } }),
  service = createClient(url, secret, { auth: { persistSession: false } }),
  admin = createClient(url, key, { auth: { persistSession: false } });
const out = [];
const ok = (name, value, detail = "") => {
  out.push({ name, pass: Boolean(value), detail });
  if (!value) throw new Error(`${name}: ${detail}`);
};
const suffix = Date.now();
let project, study, technology, serviceId, insight, testimonial, lead;
try {
  const auth = await admin.auth.signInWithPassword({
    email: process.env.SUPABASE_ADMIN_EMAIL,
    password: process.env.SUPABASE_ADMIN_PASSWORD,
  });
  ok("admin session", !auth.error, auth.error?.message);
  const uid = auth.data.user.id;
  let x = await admin
    .from("services")
    .insert({
      slug: `phase4-service-${suffix}`,
      title_en: "Phase four service",
      title_ar: "خدمة المرحلة الرابعة",
      summary_en: "A complete service record used for live verification.",
      summary_ar: "سجل خدمة كامل يستخدم للتحقق المباشر من النظام.",
      status: "draft",
      created_by: uid,
      updated_by: uid,
    })
    .select("id")
    .single();
  ok("service create", !x.error, x.error?.message);
  serviceId = x.data.id;
  x = await admin
    .from("services")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", serviceId);
  ok("service publish", !x.error, x.error?.message);
  x = await anon.from("services").select("id").eq("id", serviceId);
  ok("service public visibility", x.data?.length === 1, x.error?.message);
  x = await admin
    .from("technologies")
    .insert({
      slug: `phase4-tech-${suffix}`,
      name: "Phase4 Tech",
      category: "verification",
      description_en: "Live verification",
      description_ar: "تحقق مباشر",
      status: "published",
      active: true,
    })
    .select("id")
    .single();
  ok("technology create", !x.error, x.error?.message);
  technology = x.data.id;
  x = await admin
    .from("service_technologies")
    .insert({ service_id: serviceId, technology_id: technology });
  ok("service technology assignment", !x.error, x.error?.message);
  x = await admin
    .from("projects")
    .insert({
      slug: `phase4-project-${suffix}`,
      title_en: "Phase four project",
      title_ar: "مشروع المرحلة الرابعة",
      summary_en: "A complete project record used for live CMS verification.",
      summary_ar: "سجل مشروع كامل يستخدم للتحقق المباشر من نظام إدارة المحتوى.",
      status: "draft",
      created_by: uid,
      updated_by: uid,
    })
    .select("id")
    .single();
  ok("project create", !x.error, x.error?.message);
  project = x.data.id;
  x = await admin
    .from("project_technologies")
    .insert({ project_id: project, technology_id: technology });
  ok("project technology assignment", !x.error, x.error?.message);
  x = await admin
    .from("case_studies")
    .insert({
      project_id: project,
      overview_en: "Overview",
      overview_ar: "نظرة عامة",
      challenge_en: "Challenge",
      challenge_ar: "التحدي",
      objectives_en: "Objectives",
      objectives_ar: "الأهداف",
      solution_en: "Solution",
      solution_ar: "الحل",
      security_en: "Security",
      security_ar: "الأمان",
      status: "draft",
    })
    .select("id")
    .single();
  ok("case study create", !x.error, x.error?.message);
  study = x.data.id;
  x = await admin
    .from("customer_journey_steps")
    .insert({
      case_study_id: study,
      title_en: "Discover",
      title_ar: "اكتشاف",
      description_en: "First step",
      description_ar: "الخطوة الأولى",
      sort_order: 1,
    });
  ok("journey create", !x.error, x.error?.message);
  const nodes = await admin
    .from("architecture_nodes")
    .insert([
      {
        case_study_id: study,
        node_key: "input",
        label_en: "Input",
        label_ar: "مدخل",
        node_type: "channel",
        layer: 0,
      },
      {
        case_study_id: study,
        node_key: "output",
        label_en: "Output",
        label_ar: "مخرج",
        node_type: "output",
        layer: 1,
      },
    ])
    .select("id");
  ok("architecture nodes create", !nodes.error, nodes.error?.message);
  x = await admin
    .from("architecture_connections")
    .insert({
      case_study_id: study,
      source_node_id: nodes.data[0].id,
      target_node_id: nodes.data[1].id,
    });
  ok("architecture connection create", !x.error, x.error?.message);
  x = await admin
    .from("project_results")
    .insert({
      project_id: project,
      label_en: "Verified",
      label_ar: "موثق",
      value: "100%",
      verified: true,
      publishable: true,
      source_note: "internal only",
    });
  ok("verified result create", !x.error, x.error?.message);
  x = await admin
    .from("testimonials")
    .insert({
      project_id: project,
      client_name: "Verification Client",
      quote_en: "Verified testimonial",
      quote_ar: "شهادة موثقة",
      approved: false,
      status: "draft",
    })
    .select("id")
    .single();
  ok("testimonial moderation create", !x.error, x.error?.message);
  testimonial = x.data.id;
  let hidden = await anon
    .from("testimonials")
    .select("id")
    .eq("id", testimonial);
  ok(
    "unapproved testimonial hidden",
    hidden.data?.length === 0,
    hidden.error?.message,
  );
  x = await admin
    .from("testimonials")
    .update({
      approved: true,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", testimonial);
  ok("testimonial approve", !x.error, x.error?.message);
  x = await admin
    .from("insights")
    .insert({
      slug: `phase4-insight-${suffix}`,
      title_en: "Live insight",
      title_ar: "مقال مباشر",
      excerpt_en: "A live verified insight excerpt.",
      excerpt_ar: "مقتطف مقال تم التحقق منه مباشرة.",
      content_en: "Live verified insight body.",
      content_ar: "محتوى مقال تم التحقق منه مباشرة.",
      category: "Verification",
      status: "draft",
      created_by: uid,
      updated_by: uid,
    })
    .select("id")
    .single();
  ok("insight create", !x.error, x.error?.message);
  insight = x.data.id;
  hidden = await anon.from("insights").select("id").eq("id", insight);
  ok("insight draft hidden", hidden.data?.length === 0, hidden.error?.message);
  x = await admin
    .from("insights")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", insight);
  ok("insight publish", !x.error, x.error?.message);
  x = await service
    .from("inquiries")
    .insert({
      name: "Phase Four Lead",
      email: `phase4-${suffix}@example.com`,
      service: "Verification",
      description: "Live lead workflow verification",
      locale: "en",
    })
    .select("id")
    .single();
  ok("lead exists", !x.error, x.error?.message);
  lead = x.data.id;
  x = await admin
    .from("inquiries")
    .update({ status: "contacted" })
    .eq("id", lead);
  ok("lead workflow update", !x.error, x.error?.message);
  x = await admin
    .from("site_settings")
    .upsert({
      key: "business_status",
      value_en: "Phase 4 verification",
      value_ar: "تحقق المرحلة الرابعة",
      public: true,
      updated_by: uid,
    });
  ok("settings update", !x.error, x.error?.message);
  const setting = await anon
    .from("site_settings")
    .select("key")
    .eq("key", "business_status");
  ok(
    "public setting visibility",
    setting.data?.length === 1,
    setting.error?.message,
  );
  x = await admin
    .from("projects")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", project);
  ok("project publish", !x.error, x.error?.message);
  x = await admin
    .from("case_studies")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", study);
  ok("case study publish", !x.error, x.error?.message);
  const publicGraph = await anon
    .from("projects")
    .select(
      "id,project_technologies(technology_id),project_results(label_en),testimonials(client_name),case_studies(customer_journey_steps(title_en),architecture_nodes(label_en),architecture_connections(id))",
    )
    .eq("id", project)
    .single();
  ok(
    "published relational case study graph",
    !publicGraph.error && Boolean(publicGraph.data?.case_studies),
    publicGraph.error?.message,
  );
  const audits = await admin
    .from("audit_logs")
    .select("action,resource_id")
    .in("resource_id", [serviceId, insight, testimonial, lead]);
  ok(
    "Phase 4 audit logging",
    !audits.error && (audits.data || []).length >= 7,
    `rows=${audits.data?.length}`,
  );
  console.log(
    JSON.stringify({ passed: out.length, failed: 0, results: out }, null, 2),
  );
} finally {
  if (project) await service.from("projects").delete().eq("id", project);
  if (insight) await service.from("insights").delete().eq("id", insight);
  if (testimonial)
    await service.from("testimonials").delete().eq("id", testimonial);
  if (serviceId) await service.from("services").delete().eq("id", serviceId);
  if (technology)
    await service.from("technologies").delete().eq("id", technology);
  if (lead) await service.from("inquiries").delete().eq("id", lead);
}
