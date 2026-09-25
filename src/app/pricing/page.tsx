// Public pricing route.
import type { Metadata } from "next";
import { getMarketingLabels } from "@/backend/services/marketing-service";
import { pricingCopy } from "@/frontend/copy/pricing";
import { EnterpriseBand } from "@/frontend/components/pricing/enterprise-band";
import { PlanComparison } from "@/frontend/components/pricing/plan-comparison";
import { PlanPicker } from "@/frontend/components/pricing/plan-picker";
import { PricingFaq } from "@/frontend/components/pricing/pricing-faq";
import { PricingHero } from "@/frontend/components/pricing/pricing-hero";
import { CtaBand } from "@/frontend/components/site/cta-band";
import { CookieConsent } from "@/frontend/components/site/cookie-consent";
import { SiteFooter } from "@/frontend/components/site/site-footer";
import { SiteHeader } from "@/frontend/components/site/site-header";
import styles from "./page.module.css";

const copy = pricingCopy(getMarketingLabels());

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function PricingPage() {
  const planNames = copy.plans.map((plan) => plan.name);
  const featuredIndex = copy.plans.findIndex((plan) => plan.badge !== null);

  return (
    <div className={styles.page}>
      <SiteHeader copy={copy} />
      <main>
        <PricingHero copy={copy.hero} />
        <PlanPicker billing={copy.billing} plans={copy.plans} />
        <EnterpriseBand copy={copy.enterprise} />
        <PlanComparison copy={copy.comparison} planNames={planNames} featuredIndex={featuredIndex} />
        <PricingFaq copy={copy.faq} />
        <CtaBand copy={copy.closing} />
      </main>
      <SiteFooter brand={copy.brand} copy={copy.footer} />
      <CookieConsent copy={copy.cookies} />
    </div>
  );
}
