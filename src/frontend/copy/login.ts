// Product copy for the sign-in screen.

export function loginCopy() {
  return {
    brand: "REYNAV",
    meta: {
      title: "Sign in — REYNAV",
      description: "Sign in to your REYNAV account.",
    },
    aside: {
      tagline: "AI growth for local businesses.",
      heading: "Welcome back",
      body: "Your Growth Score, your opportunities and every draft waiting for approval — all where you left them.",
      points: [
        "One score for your whole online presence",
        "Opportunities ranked by likely impact",
        "Content and review replies ready to approve",
      ],
    },
    form: {
      heading: "Sign in",
      subheading: "Enter your details to reach your dashboard.",
      email: { label: "Email", placeholder: "you@yourbusiness.ca", autoComplete: "email" },
      password: { label: "Password", placeholder: "Your password", autoComplete: "current-password" },
      show: "Show password",
      hide: "Hide password",
      forgot: { href: "/login", label: "Forgot password?" },
      submit: "Sign in",
      submitting: "Signing in…",
      noAccount: "No account yet?",
      startTrial: { href: "/signup", label: "Start a free trial" },
      backHome: { href: "/", label: "Back to home" },
    },
    loader: {
      label: "Signing you in",
      /** Shown one after another while the workspace loads. */
      messages: ["Signing you in…", "Loading your workspace…", "Almost there…"],
    },
    demo: {
      label: "Demo account",
      note: "Authentication is simulated while the identity provider is mocked. Use these to look around.",
      emailLabel: "Email",
      passwordLabel: "Password",
      fill: "Fill demo details",
    },
    errors: {
      missing: "Enter your email and password.",
      unexpected: "Something went wrong signing you in. Please try again.",
    },
  } as const;
}

export type LoginCopy = ReturnType<typeof loginCopy>;
