export type PublicInsightSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt?: string | null;
  cover?: { url: string; alt: string } | null;
};

const knownVerificationTitle =
  /^(ui verified insight|browser verification(?: insight)?|test insight|placeholder insight)$/i;

export function isPublicEditorialInsight(
  item: Pick<PublicInsightSummary, "title" | "excerpt" | "category">,
) {
  if (item.category.trim().toLocaleLowerCase() === "verification") return false;
  return !knownVerificationTitle.test(item.title.trim());
}
