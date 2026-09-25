// Sign-up route: create an account, then straight into onboarding.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { SignupForm } from "@/frontend/components/auth/signup-form";
import { loginCopy } from "@/frontend/copy/login";
import { signupCopy } from "@/frontend/copy/signup";
import styles from "../login/page.module.css";

const copy = signupCopy();
const shared = loginCopy();

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <div className={styles.asideInner}>
          <Link href="/" className={styles.brand}>
            {shared.brand}
          </Link>
          <p className={styles.tagline}>{shared.aside.tagline}</p>

          <div className={styles.asideBody}>
            <h2 className={styles.asideHeading}>{copy.aside.heading}</h2>
            <p className={styles.asideText}>{copy.aside.body}</p>
            <ul className={styles.points}>
              {copy.aside.points.map((point) => (
                <li key={point} className={styles.point}>
                  <Check aria-hidden size={17} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Link href={shared.form.backHome.href} className={styles.back}>
          <ArrowLeft aria-hidden size={17} />
          {shared.form.backHome.label}
        </Link>
        <div className={styles.formSlot}>
          <SignupForm copy={copy.form} loaderCopy={copy.loader} />
        </div>
      </main>
    </div>
  );
}
