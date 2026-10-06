import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/dictionaries';
import { isLocale } from '@/lib/i18n/config';
import { getPublishedTechnologies } from '@/server/queries/public-content';
import { TechnologyField } from '@/components/technologies/technology-field';
import styles from './technologies.module.css';
import { engineeringLayers } from '@/content/engineering-layers';

// Statically generated and fully prefetchable: CMS reads carry no visitor cookies.
// Admin saves revalidate on demand (revalidatePublicSite); this is the fallback for
// changes made outside the admin and for recovering from a CMS outage.
export const revalidate = 60;

export default async function TechnologiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const live = await getPublishedTechnologies();
  const groups = live?.length
    ? [...Map.groupBy(live, item => item.category)].map(([title, items]) => ({ title, items: items.map(item => item.name) }))
    : d.technology.groups;
  return <section className={styles.page} data-technologies-page>
    <div className={`${styles.composition} shell`}>
      <div className={styles.intro}>
        <span className="eyebrow">{d.technology.eyebrow}</span>
        <h1>{d.technology.title}</h1>
        <p>{locale === 'ar' ? 'تقنيات مستخدمة في هذه المنصة أو تمثل طبقات تكامل واضحة. لكل منها مسؤولية محددة، وليست مجرد شعارات للعرض.' : 'These technologies are used by this platform or represent explicit integration layers—not a decorative logo collection.'}</p>
        <div className={styles.index}>{locale === 'ar' ? 'طبقات واضحة. مسؤوليات محددة.' : 'Clear layers. Defined responsibilities.'}</div>
      </div>
      <TechnologyField groups={groups} locale={locale} />
    </div>
    <EngineeringLayers locale={locale} />
  </section>;
}

// Progressive disclosure: responsibility is always visible; boundary, communication
// and security open per layer (native details/summary, keyboard accessible).
function EngineeringLayers({ locale }: { locale: 'en' | 'ar' }) {
  const e = engineeringLayers[locale];
  return <section className={`${styles.layers} shell`} aria-labelledby="engineering-layers">
    <span className={styles.layersLabel}>{e.label}</span>
    <h2 id="engineering-layers">{e.title}</h2>
    <p className={styles.layersIntro}>{e.intro}</p>
    <ol>{e.layers.map((layer, index) => <li key={layer.name}><details>
      <summary><span className={styles.layerNo} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{layer.name}</strong><bdi>{layer.tools}</bdi><span className={styles.responsibility}>{layer.responsibility}</span></summary>
      <dl>
        <div><dt>{e.fields.boundary}</dt><dd>{layer.boundary}</dd></div>
        <div><dt>{e.fields.communicates}</dt><dd>{layer.communicates}</dd></div>
        <div><dt>{e.fields.security}</dt><dd>{layer.security}</dd></div>
      </dl>
    </details></li>)}</ol>
    <p className={styles.layersClosing}>{e.closing}</p>
  </section>;
}
