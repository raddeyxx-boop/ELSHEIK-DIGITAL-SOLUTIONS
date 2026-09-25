"use client";

import Link from "next/link";
import { House, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/content/dictionaries/types";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import styles from "./header.module.css";
import { MobileDock } from "./mobile-dock";

export function Header({
  locale,
  dictionary: d,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hrefFor = (path: string) => `/${locale}${path ? `/${path}` : ""}`;
  const active = (path: string) => pathname === hrefFor(path) || (path !== "" && pathname.startsWith(`${hrefFor(path)}/`));
  const links = [
    ["", d.nav.home],
    ["services", d.nav.services],
    ["work", d.nav.work],
    ["about", d.nav.about],
    ["insights", d.nav.insights],
    ["contact", d.nav.contact],
  ];
  return (
    <>
    <header className={styles.header}>
      <div className={`${styles.inner} shell`}>
        <Link
          href={`/${locale}`}
          className={styles.logo}
          aria-label="Alsheikh Digital Solutions home"
        >
          <svg viewBox="0 0 34 34" aria-hidden="true">
            <path d="M3 27 15 5l4 7-8 15H3Zm12 0 5-9 5 9H15Zm8-18 8 18h-6l-5-9 3-9Z" />
          </svg>
          <span>
            ELSHEIK<small>DIGITAL SOLUTIONS</small>
          </span>
        </Link>
        <nav className={styles.desktop} aria-label="Primary navigation">
          {links.map(([path, label]) => (
            <Link key={path} href={hrefFor(path)} aria-current={active(path) ? "page" : undefined}>
              {path === "" && <House size={15} aria-hidden="true" />}
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <LanguageSwitcher locale={locale} label={d.localeName} />
          <Link className="button button-primary" href={`/${locale}/contact`}>
            {d.nav.start}
          </Link>
        </div>
        <button
          className={styles.toggle}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? d.nav.close : d.nav.menu}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className={styles.mobile}
          aria-label="Mobile navigation"
        >
          {links.map(([path, label]) => (
            <Link
              key={path}
              onClick={() => setOpen(false)}
              href={`/${locale}${path ? `/${path}` : ""}`}
              aria-current={active(path) ? "page" : undefined}
            >
              {path === "" && <House size={24} aria-hidden="true" />}
              {label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} label={d.localeName} />
          <Link className="button button-primary" href={`/${locale}/contact`} onClick={() => setOpen(false)}>{d.nav.start}</Link>
        </nav>
      )}
    </header>
    <MobileDock locale={locale} dictionary={d} hidden={open} />
    </>
  );
}
