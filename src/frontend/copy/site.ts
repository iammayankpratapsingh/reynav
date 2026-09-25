// Copy shared by every public marketing screen: wordmark, primary navigation and footer.

export function siteCopy() {
  return {
    brand: "REYNAV",
    nav: {
      links: [
        { href: "/#features", label: "Features" },
        { href: "/#how-it-works", label: "How it works" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources", label: "Resources" },
      ],
      login: { href: "/login", label: "Login" },
      getStarted: { href: "/login", label: "Get Started" },
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    footer: {
      tagline: "AI growth for local businesses.",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/#how-it-works", label: "How it works" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources", label: "Resources" },
        { href: "/login", label: "Login" },
      ],
      rights: "REYNAV. All rights reserved.",
      cookieSettings: "Cookie settings",
    },
    cookies: {
      banner: {
        label: "Cookie consent",
        heading: "We use cookies",
        body: "Essential cookies keep this site working. With your OK, we also load our AI chat assistant, which stores data in your browser to keep your conversation going. You can change this any time from Cookie settings in the footer.",
        acceptAll: "Accept all",
        rejectAll: "Reject all",
        manage: "Manage cookies",
      },
      settings: {
        heading: "Cookie settings",
        intro: "Choose which cookies REYNAV may use. Essential cookies are always on because the site needs them to work.",
        alwaysOn: "Always on",
        categories: {
          necessary: {
            title: "Essential",
            body: "Keep you signed in, keep the site secure and remember these cookie choices.",
          },
          functional: {
            title: "Chat assistant",
            body: "Loads the Chatbase AI chat bubble so you can ask questions about REYNAV. Chatbase stores data in your browser to keep your conversation.",
          },
        },
        acceptAll: "Accept all",
        rejectAll: "Reject all",
        save: "Save choices",
        close: "Close",
      },
    },
  } as const;
}

export type SiteCopy = ReturnType<typeof siteCopy>;
