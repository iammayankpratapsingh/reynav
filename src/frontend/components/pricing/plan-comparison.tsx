// Full feature matrix. Scrolls sideways on small screens with the feature column pinned.
import { Check, Minus } from "lucide-react";
import type { PricingCopy } from "@/frontend/copy/pricing";
import styles from "./plan-comparison.module.css";

type PlanComparisonProps = {
  copy: PricingCopy["comparison"];
  planNames: readonly string[];
  featuredIndex: number;
};

function CellValue({ value, yes, no }: { value: string | boolean; yes: string; no: string }) {
  if (value === true) {
    return (
      <span className={styles.yes}>
        <Check aria-hidden size={18} />
        <span className={styles.srOnly}>{yes}</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className={styles.no}>
        <Minus aria-hidden size={18} />
        <span className={styles.srOnly}>{no}</span>
      </span>
    );
  }
  return <span className={styles.text}>{value}</span>;
}

export function PlanComparison({ copy, planNames, featuredIndex }: PlanComparisonProps) {
  return (
    <section className={styles.section} aria-labelledby="comparison-heading">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="comparison-heading" className={styles.heading}>
          {copy.heading}
        </h2>
        <p className={styles.lead}>{copy.intro}</p>
      </div>

      <div className={styles.scroller}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{copy.heading}</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rowHead}>
                {copy.planLabel}
              </th>
              {planNames.map((name, index) => (
                <th
                  key={name}
                  scope="col"
                  className={index === featuredIndex ? `${styles.planHead} ${styles.featured}` : styles.planHead}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          {copy.groups.map((group) => (
            <tbody key={group.id}>
              <tr>
                <th scope="colgroup" colSpan={planNames.length + 1} className={styles.groupHead}>
                  {group.label}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.rowHead}>
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={planNames[index] ?? index}
                      className={index === featuredIndex ? `${styles.cell} ${styles.featured}` : styles.cell}
                    >
                      <CellValue value={value} yes={copy.yes} no={copy.no} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
