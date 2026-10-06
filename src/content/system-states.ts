import type { Locale } from "@/lib/i18n/config";

// Copy for route-level states (404, error, loading) rendered inside the locale layout.
export const systemStates = {
  en: {
    notFound: { eyebrow: "404 / Not found", title: "This route is outside the system.", body: "The page may have moved or never existed.", home: "Return home", work: "Explore our work" },
    error: { eyebrow: "System interruption", title: "Something did not load correctly.", body: "No technical details have been exposed. You can safely try again.", retry: "Try again" },
    loading: "Loading content",
  },
  ar: {
    notFound: { eyebrow: "404 / الصفحة غير موجودة", title: "هذا المسار خارج النظام.", body: "ربما نُقلت الصفحة أو لم تكن موجودة من الأساس.", home: "العودة إلى الرئيسية", work: "استكشف أعمالنا" },
    error: { eyebrow: "انقطاع مؤقت", title: "تعذّر تحميل جزء من الصفحة.", body: "لم تُعرض أي تفاصيل تقنية. يمكنك إعادة المحاولة بأمان.", retry: "أعد المحاولة" },
    loading: "جارٍ تحميل المحتوى",
  },
} satisfies Record<Locale, unknown>;

export function statesFor(locale: string | string[] | undefined) {
  return locale === "ar" ? systemStates.ar : systemStates.en;
}
