import "server-only";
import { revalidatePath } from "next/cache";

// Public routes are statically generated from the CMS. Any published change can
// surface on several of them (Home lists projects and services, case studies
// include testimonials, covers come from media), so an admin write refreshes every
// page under the locale layout (and the sitemap) instead of guessing which ones it
// touched.
export function revalidatePublicSite() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
