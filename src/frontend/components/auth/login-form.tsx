"use client";
// Sign-in form. Submits to the Server Action and shows its pending and error states. On success it plays a
// short welcome loader while the next screen is prefetched, then navigates.
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { signInAction, type LoginFormState } from "@/app/(auth)/login/actions";
import type { LoginCopy } from "@/frontend/copy/login";
import { SignInLoader } from "./sign-in-loader";
import styles from "./login-form.module.css";

/** The demo panel only renders while the identity provider is mocked, so the credential is passed in, not assumed. */
export type DemoCredentialView = LoginCopy["demo"] & { email: string; password: string };

type LoginFormProps = {
  copy: LoginCopy["form"];
  errorCopy: LoginCopy["errors"];
  loaderCopy: LoginCopy["loader"];
  demo: DemoCredentialView | null;
};

const initialState: LoginFormState = { error: null, redirectTo: null };

/** Long enough to feel deliberate, short enough never to feel slow. */
const WELCOME_MS = 2000;

export function LoginForm({ copy, errorCopy, loaderCopy, demo }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const redirectTo = state.redirectTo;

  useEffect(() => {
    if (!redirectTo) return;
    router.prefetch(redirectTo);
    const timer = setTimeout(() => router.replace(redirectTo), WELCOME_MS);
    return () => clearTimeout(timer);
  }, [redirectTo, router]);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemo = () => {
    if (!demo) return;
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>{copy.heading}</h1>
      <p className={styles.subheading}>{copy.subheading}</p>

      {state.error && (
        <p role="alert" className={styles.error}>
          <AlertCircle aria-hidden size={18} />
          {state.error || errorCopy.unexpected}
        </p>
      )}

      <form action={formAction} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>{copy.email.label}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete={copy.email.autoComplete}
            placeholder={copy.email.placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.labelRow}>
            <span className={styles.label}>{copy.password.label}</span>
            <Link href={copy.forgot.href} className={styles.forgot}>
              {copy.forgot.label}
            </Link>
          </span>
          <span className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete={copy.password.autoComplete}
              placeholder={copy.password.placeholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${styles.input} ${styles.passwordInput}`}
            />
            <button
              type="button"
              className={styles.reveal}
              aria-label={showPassword ? copy.hide : copy.show}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((shown) => !shown)}
            >
              {showPassword ? <EyeOff aria-hidden size={19} /> : <Eye aria-hidden size={19} />}
            </button>
          </span>
        </label>

        <button type="submit" className={styles.submit} disabled={isPending || redirectTo !== null}>
          {isPending && <LoaderCircle aria-hidden size={19} className={styles.spinner} />}
          {isPending ? copy.submitting : copy.submit}
        </button>
      </form>

      {demo && (
        <div className={styles.demo}>
          <p className={styles.demoHead}>{demo.label}</p>
          <dl className={styles.demoList}>
            <div className={styles.demoRow}>
              <dt>{demo.emailLabel}</dt>
              <dd>{demo.email}</dd>
            </div>
            <div className={styles.demoRow}>
              <dt>{demo.passwordLabel}</dt>
              <dd>{demo.password}</dd>
            </div>
          </dl>
          <button type="button" className={styles.demoFill} onClick={fillDemo}>
            {demo.fill}
          </button>
          <p className={styles.demoNote}>{demo.note}</p>
        </div>
      )}

      {redirectTo && <SignInLoader copy={loaderCopy} durationMs={WELCOME_MS} />}

      <p className={styles.footer}>
        {copy.noAccount}{" "}
        <Link href={copy.startTrial.href} className={styles.footerLink}>
          {copy.startTrial.label}
        </Link>
      </p>
    </div>
  );
}
