import { notFound } from "next/navigation";
import { Tajawal } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/content/dictionaries";
import { isLocale, localeDirection, locales } from "@/lib/i18n/config";

// Arabic typeface, self-hosted by next/font. Only the variable is exposed; CSS
// applies it under html[lang="ar"], so English pages never render (or fetch) it.
// Not preloaded: a preload here would push Arabic font files to English pages too.
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], variable: "--font-tajawal", display: "swap", preload: false });

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const dictionary = getDictionary(rawLocale);
  return (
    <html lang={rawLocale} dir={localeDirection(rawLocale)} className={tajawal.variable} data-scroll-behavior="smooth">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: rawLocale === "ar" ? "شركة الشيخ للحلول الرقمية" : "Alsheikh Digital Solutions", url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" }).replace(/</g, "\\u003c") }} />
        <a className="skip-link" href="#main">{rawLocale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
        <Header locale={rawLocale} dictionary={dictionary} />
        <main id="main">{children}</main>
        <Footer locale={rawLocale} dictionary={dictionary} />
      </body>
    </html>
  );
}
