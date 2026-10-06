import Link from "next/link";
import type { Dictionary } from "@/content/dictionaries/types";
import type { Locale } from "@/lib/i18n/config";
import styles from "./footer.module.css";

export function Footer({
  locale,
  dictionary: d,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <footer className={styles.footer}>
      <div className="shell">
        <div className={styles.top}>
          <div>
            <strong>
              ELSHEIK
              <br />
              DIGITAL SOLUTIONS
            </strong>
            <p>{d.footer.statement}</p>
          </div>
          <div>
            <span>{d.footer.explore}</span>
            <Link href={`/${locale}/work`}>{d.nav.work}</Link>
            <Link href={`/${locale}/about`}>{d.nav.about}</Link>
            <Link href={`/${locale}/insights`}>{d.nav.insights}</Link>
          </div>
          <div>
            <span>{d.footer.services}</span>
            <Link href={`/${locale}/services`}>{d.nav.services}</Link>
            <Link href={`/${locale}/process`}>
              {locale === "ar" ? "المنهج" : "Process"}
            </Link>
            <Link href={`/${locale}/technologies`}>
              {locale === "ar" ? "التقنيات" : "Technologies"}
            </Link>
          </div>
          <div>
            <span>{d.footer.contact}</span>
            <Link href={`/${locale}/contact`}>{d.nav.start}</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Alsheikh Digital Solutions</span>
          <span>{d.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
