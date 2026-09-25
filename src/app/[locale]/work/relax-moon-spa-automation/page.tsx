import CaseStudyPage, { generateMetadata as caseStudyMetadata } from "../[slug]/page";
import { SHOWCASE_SLUG } from "../[slug]/showcase";

// The showcase case study as a static segment (it takes precedence over [slug]):
// prerendered and fully prefetchable, so Work -> case study is immediate. It shares
// the [slug] page, whose CMS failures fall back to the built-in showcase content.
// Admin saves revalidate on demand (revalidatePublicSite); this is the fallback.
export const revalidate = 60;

type Params = { params: Promise<{ locale: string }> };
const withSlug = (params: Params["params"]) => params.then(value => ({ ...value, slug: SHOWCASE_SLUG }));

export function generateMetadata({ params }: Params) {
  return caseStudyMetadata({ params: withSlug(params) });
}

export default function ShowcaseCaseStudyPage({ params }: Params) {
  return <CaseStudyPage params={withSlug(params)} />;
}
