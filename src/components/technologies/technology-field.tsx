'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { Server, Braces, Workflow, KeyRound, ShieldCheck, LockKeyhole, ListChecks, type LucideIcon } from 'lucide-react';
import styles from './technology-field.module.css';

export type TechnologyGroup = { title: string; items: string[] };
const capabilityIcons: Record<string, LucideIcon> = {
  'Next.js Server': Server, 'API Routes': Braces, 'Server Actions': Workflow,
  Auth: KeyRound, RLS: ShieldCheck, 'Access Control': LockKeyhole, Validation: ListChecks,
};

// Presentation of implemented responsibilities, not synthetic CMS records.
// Evidence: app/api/inquiries, app/admin/*/actions, lib/auth/admin and RLS migrations.
function withArchitectureGroups(groups: TechnologyGroup[]): TechnologyGroup[] {
  const result = groups.map(group => ({ ...group, items: [...group.items] }));
  for (const capability of [
    { title: 'backend', items: ['Next.js Server', 'API Routes', 'Server Actions'] },
    { title: 'security', items: ['Auth', 'RLS', 'Access Control', 'Validation'] },
  ]) {
    const existing = result.find(group => categoryKey(group.title) === capability.title);
    if (existing) {
      existing.items.push(...capability.items.filter(name => !existing.items.some(item => item.toLowerCase() === name.toLowerCase())));
    } else result.push(capability);
  }
  const order = ['verification', 'frontend', 'backend', 'data', 'automation', 'security', 'testing', 'infrastructure'];
  const rank = (title: string) => { const index = order.indexOf(categories[categoryKey(title)]?.zone ?? categoryKey(title)); return index < 0 ? order.length : index; };
  return result.sort((a, b) => rank(a.title) - rank(b.title));
}
const icons: Record<string, string> = {
  'next.js': 'nextdotjs', react: 'react', typescript: 'typescript', supabase: 'supabase',
  postgresql: 'postgresql', n8n: 'n8n', playwright: 'playwright', vercel: 'vercel',
};
const categories: Record<string, { ar: string; en: string; zone: string }> = {
  backend: { ar: 'الواجهة الخلفية', en: 'Backend', zone: 'backend' },
  security: { ar: 'الأمان', en: 'Security', zone: 'security' },
  frontend: { ar: 'الواجهات', en: 'Frontend', zone: 'frontend' },
  interface: { ar: 'الواجهات', en: 'Interface', zone: 'frontend' },
  data: { ar: 'البيانات', en: 'Data', zone: 'data' },
  automation: { ar: 'الأتمتة', en: 'Automation', zone: 'automation' },
  testing: { ar: 'الاختبار', en: 'Testing', zone: 'testing' },
  quality: { ar: 'الجودة', en: 'Quality', zone: 'testing' },
  infrastructure: { ar: 'البنية التحتية', en: 'Infrastructure', zone: 'infrastructure' },
  verification: { ar: 'التحقق', en: 'Verification', zone: 'verification' },
};

function categoryKey(title: string) {
  const aliases: Record<string, string> = { 'الواجهات': 'frontend', 'البيانات': 'data', 'الأتمتة': 'automation', 'الجودة': 'quality', 'البنية': 'infrastructure', 'الواجهة الخلفية': 'backend', 'الأمان': 'security' };
  return aliases[title] ?? title.toLowerCase();
}

function TechnologyNode({ name, index }: { name: string; index: number }) {
  const icon = icons[name.toLowerCase()];
  const CapabilityIcon = capabilityIcons[name];
  return <li className={styles.node} data-technology={name} data-drift={index % 3}
    style={{ '--duration': `${12 + index % 5 * 2}s`, '--delay': `${-index * 2.3}s` } as CSSProperties}>
    <div className={styles.badge}>
      {CapabilityIcon ? <CapabilityIcon className={styles.capabilityIcon} data-technology-icon={name} aria-hidden="true" /> : icon ? <span className={styles.icon} data-technology-icon={name} aria-hidden="true"
        style={{ maskImage: `url(/technology-icons/${icon}.svg)`, WebkitMaskImage: `url(/technology-icons/${icon}.svg)` }} />
        : <span className={styles.monogram} aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>}
      <bdi dir="ltr">{name}</bdi>
    </div>
  </li>;
}

export function TechnologyField({ groups, locale }: { groups: TechnologyGroup[]; locale: 'en' | 'ar' }) {
  const displayGroups = withArchitectureGroups(groups);
  const field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = field.current;
    if (!element) return;
    let visible = false;
    const update = () => { element.dataset.running = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .05 });
    observer.observe(element); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <div ref={field} className={styles.field} data-technology-field data-running="false">
    <div className={styles.fieldTop}><span>{locale === 'ar' ? 'منظومة التقنيات' : 'TECHNOLOGY ECOSYSTEM'}</span><span aria-hidden="true">ELS / 01</span></div>
    <div className={styles.zones}>
      {displayGroups.map((group, groupIndex) => {
        const category = categories[categoryKey(group.title)];
        const title = category ? (locale === 'ar' ? category.ar : category.en) : group.title;
        return <section className={styles.zone} data-category={category?.zone ?? 'custom'} key={group.title} aria-label={title}>
          <h2><span aria-hidden="true">{String(groupIndex + 1).padStart(2, '0')}</span>{title}</h2>
          <ul className={styles.nodes}>{group.items.map((name, index) => <TechnologyNode key={`${name}-${index}`} name={name} index={groupIndex * 3 + index} />)}</ul>
        </section>;
      })}
    </div>
    <div className={styles.fieldBottom}><span aria-hidden="true" />{locale === 'ar' ? 'لكل تقنية دور واضح.' : 'Every technology has a defined role.'}</div>
  </div>;
}
