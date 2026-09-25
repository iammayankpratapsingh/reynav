// Public landing route.
import { getLandingContent } from "@/backend/services/marketing-service";
import { homeCopy } from "@/frontend/copy/home";
import { CtaBand } from "@/frontend/components/site/cta-band";
import { FeatureStrip } from "@/frontend/components/landing/feature-strip";
import { FeatureGrid } from "@/frontend/components/landing/feature-grid";
import { GrowthJourney } from "@/frontend/components/landing/growth-journey";
import { Hero } from "@/frontend/components/landing/hero";
import { HowItWorks } from "@/frontend/components/landing/how-it-works";
import { CookieConsent } from "@/frontend/components/site/cookie-consent";
import { SiteFooter } from "@/frontend/components/site/site-footer";
import { SiteHeader } from "@/frontend/components/site/site-header";
import styles from "./page.module.css";

export default function HomePage() {
  const content = getLandingContent();
  const copy = homeCopy(content.labels);

  return (
    <div className={styles.page}>
      <SiteHeader copy={copy} />
      <main>
        <div className={styles.firstScreen}>
          <Hero copy={copy.hero} image={content.heroImage} />
          <FeatureStrip copy={copy.features} />
        </div>
        <FeatureGrid copy={copy.featureGrid} />
        <HowItWorks copy={copy.howItWorks} />
        <GrowthJourney copy={copy.journey} />
        <CtaBand copy={copy.closing} />
      </main>
      <SiteFooter brand={copy.brand} copy={copy.footer} />
      <CookieConsent copy={copy.cookies} />
    </div>
  );
}
