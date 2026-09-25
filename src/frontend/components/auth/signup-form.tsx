"use client";
// Sign-up form. Submits to the Server Action, shows errors, and on success plays the welcome loader while
// onboarding is prefetched.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { signUpAction, type SignupFormState } from "@/app/(auth)/signup/actions";
import type { SignupCopy } from "@/frontend/copy/signup";
import { SignInLoader } from "./sign-in-loader";
import styles from "./login-form.module.css";

const initialState: SignupFormState = { error: null, redirectTo: null };
const WELCOME_MS = 2000;

type Props = { copy: SignupCopy["form"]; loaderCopy: SignupCopy["loader"] };

export function SignupForm({ copy, loaderCopy }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = state.redirectTo;

  useEffect(() => {
    if (!redirectTo) return;
    router.prefetch(redirectTo);
    const timer = setTimeout(() => router.replace(redirectTo), WELCOME_MS);
    return () => clearTimeout(timer);
  }, [redirectTo, router]);

  const fields = [
    { name: "name", type: "text", ...copy.name },
    { name: "businessName", type: "text", ...copy.businessName },
    { name: "email", type: "email", ...copy.email },
  ] as const;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>{copy.heading}</h1>
      <p className={styles.subheading}>{copy.subheading}</p>

      {state.error && (
        <p role="alert" className={styles.error}>
          <AlertCircle aria-hidden size={18} />
          {state.error}
        </p>
      )}

      <form action={formAction} className={styles.form}>
        {fields.map((field) => (
          <label key={field.name} className={styles.field}>
            <span className={styles.label}>{field.label}</span>
            <input
              type={field.type}
              name={field.name}
              required
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              className={styles.input}
            />
          </label>
        ))}

        <label className={styles.field}>
          <span className={styles.label}>{copy.password.label}</span>
          <span className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              autoComplete={copy.password.autoComplete}
              placeholder={copy.password.placeholder}
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

      <p className={styles.demoNote}>{copy.simulated}</p>

      {redirectTo && <SignInLoader copy={loaderCopy} durationMs={WELCOME_MS} />}

      <p className={styles.footer}>
        {copy.haveAccount}{" "}
        <Link href={copy.signIn.href} className={styles.footerLink}>
          {copy.signIn.label}
        </Link>
      </p>
    </div>
  );
}
