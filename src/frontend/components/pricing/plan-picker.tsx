"use client";
// Plan cards with a monthly / yearly billing switch. Prices animate between the two periods.
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import type { PricingCopy } from "@/frontend/copy/pricing";
import styles from "./plan-picker.module.css";

type Period = "monthly" | "yearly";

type PlanPickerProps = {
  billing: PricingCopy["billing"];
  plans: PricingCopy["plans"];
};

export function PlanPicker({ billing, plans }: PlanPickerProps) {
  const [period, setPeriod] = useState<Period>("monthly");
  const options = [billing.monthly, billing.yearly] as const;

  return (
    <section className={styles.section} aria-labelledby="plans-heading">
      <h2 id="plans-heading" className={styles.srOnly}>
        Plans
      </h2>

      <div className={styles.switchRow}>
        <div className={styles.switch} role="group" aria-label={billing.label}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.switchOption}
              aria-pressed={period === option.id}
              onClick={() => setPeriod(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className={styles.saveNote}>
          <Sparkles aria-hidden size={15} />
          {billing.saveNote}
        </p>
      </div>

      <ul className={styles.grid}>
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={plan.badge ? `${styles.card} ${styles.featured}` : styles.card}
          >
            {plan.badge && <p className={styles.cardBadge}>{plan.badge}</p>}
            <h3 className={styles.planName}>{plan.name}</h3>
            <p className={styles.tagline}>{plan.tagline}</p>

            <p className={styles.price}>
              <span className={styles.currency}>$</span>
              <span key={period} className={styles.amount}>
                {period === "monthly" ? plan.monthly : plan.yearly}
              </span>
              <span className={styles.per}>{billing.perMonth}</span>
            </p>
            <p className={styles.billingNote}>
              {period === "monthly" ? billing.monthlyNote : billing.yearlyNote}
            </p>

            <Link href={plan.cta.href} className={styles.cta}>
              {plan.cta.label}
            </Link>

            <p className={styles.featuresLabel}>{plan.featuresLabel}</p>
            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature} className={styles.feature}>
                  <Check aria-hidden size={17} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
