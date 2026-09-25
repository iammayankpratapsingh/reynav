// Frequently asked questions, as a native disclosure list so it works without JavaScript.
import { Plus } from "lucide-react";
import type { PricingCopy } from "@/frontend/copy/pricing";
import styles from "./pricing-faq.module.css";

export function PricingFaq({ copy }: { copy: PricingCopy["faq"] }) {
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="faq-heading" className={styles.heading}>
            {copy.heading}
          </h2>
        </div>

        <ul className={styles.list}>
          {copy.items.map((item) => (
            <li key={item.id}>
              <details className={styles.item}>
                <summary className={styles.question}>
                  <span>{item.question}</span>
                  <Plus aria-hidden size={20} className={styles.icon} />
                </summary>
                <p className={styles.answer}>{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
