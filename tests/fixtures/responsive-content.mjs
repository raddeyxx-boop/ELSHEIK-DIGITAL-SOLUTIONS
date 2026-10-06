// Sanitized, read-only public records for the responsive detail-page audit.
// Enabled only by --responsive-content; never writes to the real CMS.
export const insight = {
  slug: 'responsive-demo', title_en: 'Designing dependable automation across teams and systems',
  title_ar: 'تصميم أنظمة أتمتة موثوقة تربط فرق العمل والأنظمة',
  excerpt_en: 'A fictional editorial record with long text, technical identifiers and code.',
  excerpt_ar: 'مقال تجريبي خيالي لفحص النصوص الطويلة والمعرّفات التقنية والشيفرة.',
  category: 'Systems engineering', author: 'ELSHEIK / QA fixture', published_at: '2026-10-06T00:00:00Z',
  content_en: '## Clear boundaries\n\nKeep each responsibility understandable, even on a small screen.\n\nhttps://example.invalid/automation/customer-confirmation-and-operational-coordination\n\n- Trace state changes\n- Verify responses\n\n> A sent request is not a verified result.\n\n```ts\nconst correlationId = "CUSTOMER_CONFIRMATION_OPERATIONAL_COORDINATION_2026";\n```',
  content_ar: '## حدود واضحة\n\nاجعل مسؤولية كل جزء مفهومة، حتى على الشاشات الصغيرة.\n\nhttps://example.invalid/automation/customer-confirmation-and-operational-coordination\n\n- تتبّع تغيّر الحالة\n- تحقّق من الاستجابة\n\n> إرسال الطلب لا يعني نجاحه.\n\n```ts\nconst correlationId = "CUSTOMER_CONFIRMATION_OPERATIONAL_COORDINATION_2026";\n```',
  media: null,
};
export const project = {
  id: 'responsive-project', slug: 'responsive-demo',
  title_en: 'Connected customer operations platform', title_ar: 'منصة مترابطة لإدارة عمليات العملاء',
  summary_en: 'A fictional public project for checking the existing generic case-study layout.',
  summary_ar: 'مشروع عام خيالي لفحص تخطيط دراسة الحالة الحالية.',
  industry_en: 'Service operations', industry_ar: 'عمليات الخدمات', year: '2026', is_demo: true,
};
export const caseStudy = {
  id: 'responsive-case', overview_en: 'A clear operational view across teams.', overview_ar: 'رؤية تشغيلية واضحة بين فرق العمل.',
  challenge_en: 'Coordinate requests while keeping customer records private.', challenge_ar: 'تنسيق الطلبات مع حماية خصوصية سجلات العملاء.',
  objectives_en: 'Make state changes visible and understandable.', objectives_ar: 'إظهار تغيّرات الحالة بصورة واضحة ومفهومة.',
  solution_en: 'A shared interface with verified boundaries.', solution_ar: 'واجهة مشتركة بحدود موثوقة.',
  security_en: 'Access and validation stay server-side.', security_ar: 'يبقى الوصول والتحقق على الخادم.',
};
export function responsiveRecord(url, single) {
  const table = url.pathname.split('/').at(-1);
  if (table === 'insights') {
    const slug=url.searchParams.get('slug');
    const records=slug ? (slug==='eq.responsive-demo'?[insight]:[]) : Array.from({length:5},(_,index)=>({
    ...insight,
    slug:index===0?insight.slug:`responsive-demo-${index}`,
    title_en:index===0?insight.title_en:`Dependable systems — public fixture ${index}`,
    title_ar:index===0?insight.title_ar:`أنظمة موثوقة — بيانات اختبار عامة ${index}`,
    category:index%2?'Automation':'Systems engineering',
    }));
    return single ? records[0]??null : records;
  }
  if (table === 'projects' && url.searchParams.get('slug') === 'eq.responsive-demo') return project;
  if (table === 'case_studies' && url.searchParams.get('project_id') === 'eq.responsive-project') return caseStudy;
  if (table === 'project_results' && url.searchParams.get('project_id') === 'eq.responsive-project') return [{label_en:'Verified fixture result',label_ar:'نتيجة تجريبية موثقة',value:'100%',context_en:'Fictional test data only.',context_ar:'بيانات اختبار خيالية فقط.'}];
  return undefined;
}
