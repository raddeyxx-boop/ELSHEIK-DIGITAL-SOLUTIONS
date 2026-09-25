"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { switchLocalePath, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const target = locale === "en" ? "ar" : "en";
  useEffect(() => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);
  return (
    <Link
      className="language"
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
    >
      {label}
    </Link>
  );
}
