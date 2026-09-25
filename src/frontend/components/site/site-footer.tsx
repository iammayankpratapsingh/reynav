// Landing footer: wordmark, tagline and secondary links, closed by an oversized brand wordmark.
import Link from "next/link";
import type { SiteCopy } from "@/frontend/copy/site";
import { CookieSettingsButton } from "./cookie-settings-button";
import { FooterWordmark } from "./footer-wordmark";
import styles from "./site-footer.module.css";

export function SiteFooter({ brand, copy }: { brand: string; copy: SiteCopy["footer"] }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>{brand}</p>
          <p className={styles.tagline}>{copy.tagline}</p>
        </div>
        <nav aria-label="Footer" className={styles.links}>
          {copy.links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
          <CookieSettingsButton label={copy.cookieSettings} className={`${styles.link} ${styles.linkButton}`} />
        </nav>
      </div>
      <p className={styles.rights}>© {copy.rights}</p>
      <FooterWordmark brand={brand} />
    </footer>
  );
}
