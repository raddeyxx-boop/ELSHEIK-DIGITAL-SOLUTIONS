export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function switchLocalePath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts[1] = nextLocale;
  else parts.splice(1, 0, nextLocale);
  return parts.join("/") || `/${nextLocale}`;
}

