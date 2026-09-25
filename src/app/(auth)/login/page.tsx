// Login screen route; delegates identity to the auth service.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { isMockIdentity } from "@/backend/adapters/identity-provider";
import { demoCredential } from "@/backend/adapters/identity-provider/mock";
import { LoginForm, type DemoCredentialView } from "@/frontend/components/auth/login-form";
import { loginCopy } from "@/frontend/copy/login";
import styles from "./page.module.css";

const copy = loginCopy();

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function LoginPage() {
  const demo: DemoCredentialView | null = isMockIdentity()
    ? { ...copy.demo, email: demoCredential.email, password: demoCredential.password }
    : null;

  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <div className={styles.asideInner}>
          <Link href="/" className={styles.brand}>
            {copy.brand}
          </Link>
          <p className={styles.tagline}>{copy.aside.tagline}</p>

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
        <Link href={copy.form.backHome.href} className={styles.back}>
          <ArrowLeft aria-hidden size={17} />
          {copy.form.backHome.label}
        </Link>
        <div className={styles.formSlot}>
          <LoginForm copy={copy.form} errorCopy={copy.errors} loaderCopy={copy.loader} demo={demo} />
        </div>
      </main>
    </div>
  );
}
