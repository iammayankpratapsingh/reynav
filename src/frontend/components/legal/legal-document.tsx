// A legal document page body: title and date, a table of contents, then the numbered sections.
import type { LegalCopy } from "@/frontend/copy/legal";
import styles from "./legal-document.module.css";

type Props = {
  hero: LegalCopy["hero"];
  intro: string;
  contentsLabel: string;
  sections: LegalCopy["sections"];
};

export function LegalDocument({ hero, intro, contentsLabel, sections }: Props) {
  return (
    <article className={styles.article} aria-labelledby="legal-heading">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 id="legal-heading" className={styles.heading}>
          {hero.title}
        </h1>
        <p className={styles.updated}>
          {hero.updatedLabel}: <time>{hero.updated}</time>
        </p>
        <p className={styles.intro}>{intro}</p>
      </header>

      <div className={styles.body}>
        <nav className={styles.contents} aria-label={contentsLabel}>
          <p className={styles.contentsLabel}>{contentsLabel}</p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.sections}>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2 className={styles.sectionHeading}>
                <span className={styles.number}>{index + 1}.</span>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
