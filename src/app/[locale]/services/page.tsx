import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/page-hero";
import { ServiceList } from "@/components/services/service-list";
import { getDictionary } from "@/content/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { getPublishedServices } from "@/server/queries/public-content";
import { serviceScope } from "@/content/service-scope";

// Statically generated and fully prefetchable: CMS reads carry no visitor cookies.
// Admin saves revalidate on demand (revalidatePublicSite); this is the fallback for
// changes made outside the admin and for recovering from a CMS outage.
export const revalidate = 60;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const live = await getPublishedServices(locale);
  const scope = serviceScope[locale];
  // Only the current locale's scope reaches the client component.
  const services = (live?.length ? live : d.services.items).map((service) => ({ ...service, scope: scope.items[service.id] }));
  return (
    <>
      <PageHero preset="services"
        eyebrow={d.services.eyebrow}
        title={d.services.title}
        lead={d.services.intro}
      />
      <div className="shell">
        <ServiceList
          services={services}
          locale={locale}
          variant="detail"
          contactLabel={d.nav.start}
          scopeLabels={scope.labels}
        />
      </div>
    </>
  );
}
