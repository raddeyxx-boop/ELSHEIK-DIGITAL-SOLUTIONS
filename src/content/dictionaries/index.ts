import { ar } from "./ar";
import { en } from "./en";
import type { Locale } from "@/lib/i18n/config";

export function getDictionary(locale: Locale) {
  return locale === "ar" ? ar : en;
}

