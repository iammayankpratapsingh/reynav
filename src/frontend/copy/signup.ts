// Product copy for the sign-up screen.

export function signupCopy() {
  return {
    meta: { title: "Start your free trial — REYNAV", description: "Create your REYNAV account." },
    aside: {
      heading: "Grow from the searches you're missing",
      body: "Tell us your website and we'll show you which services people search for, where you're losing them, and what to do this week.",
      points: [
        "A full scan of your online presence in minutes",
        "Opportunities ranked by the bookings they could bring",
        "A 30-day plan with one task a day",
      ],
    },
    form: {
      heading: "Create your account",
      subheading: "Free trial. No card needed.",
      name: { label: "Your name", placeholder: "Alex Rivera", autoComplete: "name" },
      businessName: { label: "Business name", placeholder: "Your business", autoComplete: "organization" },
      email: { label: "Email", placeholder: "you@yourbusiness.ca", autoComplete: "email" },
      password: { label: "Password", placeholder: "At least 8 characters", autoComplete: "new-password" },
      show: "Show password",
      hide: "Hide password",
      submit: "Create account",
      submitting: "Creating account…",
      haveAccount: "Already have an account?",
      signIn: { href: "/login", label: "Sign in" },
      simulated: "Accounts are simulated while the identity provider is mocked, and reset when the server restarts.",
    },
    loader: {
      label: "Creating your account",
      messages: ["Creating your account…", "Setting up your workspace…", "Almost there…"],
    },
  } as const;
}

export type SignupCopy = ReturnType<typeof signupCopy>;
