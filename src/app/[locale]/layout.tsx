import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/content/dictionaries";
import { isLocale, localeDirection, locales } from "@/lib/i18n/config";

// Arabic typeface (Tajawal, @font-face in globals.css). Preloaded only for Arabic so
// its glyphs are ready at first paint (no swap shift) and English pages fetch nothing.
// A next/font loader here would preload it for every locale sharing this layout.
const arabicFonts = ["/fonts/tajawal/tajawal-arabic-400-v12.woff2", "/fonts/tajawal/tajawal-arabic-700-v12.woff2"];

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const dictionary = getDictionary(rawLocale);
  if (rawLocale === "ar") for (const href of arabicFonts) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang={rawLocale} dir={localeDirection(rawLocale)} data-scroll-behavior="smooth">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: rawLocale === "ar" ? "شركة الشيخ للحلول الرقمية" : "Alsheikh Digital Solutions", url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" }).replace(/</g, "\\u003c") }} />
        <a className="skip-link" href="#main">{rawLocale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
        <Header locale={rawLocale} dictionary={{ nav: dictionary.nav, localeName: dictionary.localeName }} />
        <main id="main">{children}</main>
        <Footer locale={rawLocale} dictionary={dictionary} />
      </body>
    </html>
  );
}
