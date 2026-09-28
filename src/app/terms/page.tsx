// Public Terms route.
import type { Metadata } from "next";
import { LegalDocument } from "@/frontend/components/legal/legal-document";
import { CookieConsent } from "@/frontend/components/site/cookie-consent";
import { SiteFooter } from "@/frontend/components/site/site-footer";
import { SiteHeader } from "@/frontend/components/site/site-header";
import { termsCopy } from "@/frontend/copy/legal";
import styles from "./page.module.css";

const copy = termsCopy();

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <SiteHeader copy={copy} />
      <main>
        <LegalDocument hero={copy.hero} intro={copy.intro} contentsLabel={copy.contentsLabel} sections={copy.sections} />
      </main>
      <SiteFooter brand={copy.brand} copy={copy.footer} />
      <CookieConsent copy={copy.cookies} />
    </div>
  );
}
