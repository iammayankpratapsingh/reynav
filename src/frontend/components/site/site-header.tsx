// Public site header: wordmark, primary navigation and Get Started call to action.
import Link from "next/link";
import type { SiteCopy } from "@/frontend/copy/site";
import { MobileMenu } from "./mobile-menu";
import styles from "./site-header.module.css";

export function SiteHeader({ copy }: { copy: SiteCopy }) {
  const { brand, nav } = copy;
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {brand}
      </Link>

      <nav aria-label="Main" className={styles.nav}>
        {[...nav.links, nav.login].map((link) => (
          <Link key={link.href} href={link.href} className={styles.navLink}>
            {link.label}
          </Link>
        ))}
        <Link href={nav.getStarted.href} className={styles.cta}>
          {nav.getStarted.label}
        </Link>
      </nav>

      <MobileMenu
        links={[...nav.links, nav.login]}
        cta={nav.getStarted}
        openLabel={nav.openMenu}
        closeLabel={nav.closeMenu}
      />
    </header>
  );
}
