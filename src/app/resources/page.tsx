// Public resources route.
import type { Metadata } from "next";
import { getMarketingLabels } from "@/backend/services/marketing-service";
import { resourcesCopy } from "@/frontend/copy/resources";
import { NotifyBand } from "@/frontend/components/resources/notify-band";
import { ResourceCategories } from "@/frontend/components/resources/resource-categories";
import { ResourceLibrary } from "@/frontend/components/resources/resource-library";
import { ResourcesHero } from "@/frontend/components/resources/resources-hero";
import { CtaBand } from "@/frontend/components/site/cta-band";
import { CookieConsent } from "@/frontend/components/site/cookie-consent";
import { SiteFooter } from "@/frontend/components/site/site-footer";
import { SiteHeader } from "@/frontend/components/site/site-header";
import styles from "./page.module.css";

const copy = resourcesCopy(getMarketingLabels());

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function ResourcesPage() {
  return (
    <div className={styles.page}>
      <SiteHeader copy={copy} />
      <main>
        <ResourcesHero copy={copy.hero} />
        <ResourceCategories copy={copy.categories} />
        <ResourceLibrary copy={copy.library} />
        <NotifyBand copy={copy.notify} />
        <CtaBand copy={copy.closing} />
      </main>
      <SiteFooter brand={copy.brand} copy={copy.footer} />
      <CookieConsent copy={copy.cookies} />
    </div>
  );
}
