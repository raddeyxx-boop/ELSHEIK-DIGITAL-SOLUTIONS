import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export function Arrow({ locale, size = 16 }: { locale: Locale; size?: number }) {
  return locale === "ar" ? <ArrowLeft size={size} aria-hidden="true" /> : <ArrowRight size={size} aria-hidden="true" />;
}

