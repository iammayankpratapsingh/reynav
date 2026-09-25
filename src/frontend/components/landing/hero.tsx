// Landing hero: headline, value proposition, calls to action and the vertical's hero image.
import Image from "next/image";
import Link from "next/link";
import { CirclePlay } from "lucide-react";
import type { HomeCopy } from "@/frontend/copy/home";
import type { VerticalImage } from "@/shared/types/vertical";
import styles from "./hero.module.css";

type HeroProps = {
  copy: HomeCopy["hero"];
  image: VerticalImage;
};

export function Hero({ copy, image }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.media}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="(min-width: 1024px) 100vw, 100vw"
          className={styles.image}
        />
        <p className={styles.slogan}>
          {copy.imageSlogan.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </p>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 id="hero-heading" className={styles.headline}>
          {copy.headlineLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className={styles.tagline}>{copy.tagline}</p>
        <p className={styles.description}>{copy.description}</p>
        <div className={styles.actions}>
          <Link href={copy.primaryCta.href} className={styles.primary}>
            {copy.primaryCta.label}
          </Link>
          <a href={copy.secondaryCta.href} className={styles.secondary}>
            <CirclePlay aria-hidden size={18} strokeWidth={2} />
            {copy.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
