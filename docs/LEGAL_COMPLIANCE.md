# Legal and Compliance Status (Canada)

_Last checked: 2026-09-28 · Applies to: the public website and the REYNAV app_

## TL;DR

- **Built:** a Privacy Policy page, a Terms of Service page, footer links to both, and the cookie banner and settings (built earlier).
- **Before launch:** fill in the company details that are still placeholders, have a Canadian lawyer review both pages, and add the accept-terms line to the sign-up page.
- **Next:** a Data Processing Agreement, a list of service providers, messaging rules for review requests, and an accessibility statement. Add French versions if you sell in Quebec.

> These pages are a working draft, not legal advice. A Canadian lawyer must review them before launch.

---

## 1. Laws that apply

| Law | What it covers | Why it applies to REYNAV |
|---|---|---|
| **PIPEDA** (federal) | How businesses collect, use and share personal information | We collect account, business, Google and booking data |
| **Quebec Law 25** | Stricter privacy rules for Quebec residents | Applies if any customer or user is in Quebec |
| **CASL** (Canada's anti-spam law) | Consent for commercial emails and messages | We send weekly reports, marketing emails and review requests |
| **AODA** (Ontario accessibility law) | Accessible websites | Required by law at 50+ employees. Good practice before then |
| **Bill 96** (Quebec language law) | Standard contracts offered in French first | Applies if we sell in Quebec |
| **Competition Act** | Marketing claims must be truthful | Claims like "More Revenue" need to be supported. Estimates are already shown as ranges |
| **Google API Services User Data Policy** | Rules for apps that use Google user data | Needed for Google to approve access to Business Profile, Search Console and Analytics |

---

## 2. What was built

| Item | Status | Where |
|---|---|---|
| Privacy Policy page (`/privacy`) | ✅ Built | [src/app/privacy/page.tsx](../src/app/privacy/page.tsx) |
| Terms of Service page (`/terms`) | ✅ Built | [src/app/terms/page.tsx](../src/app/terms/page.tsx) |
| Footer links: **Privacy**, **Terms and Conditions** | ✅ Built | [src/frontend/copy/site.ts](../src/frontend/copy/site.ts) |
| Text for both pages | ✅ Built | [src/frontend/copy/legal.ts](../src/frontend/copy/legal.ts) |
| Page layout (title, date, contents list, numbered sections) | ✅ Built | [src/frontend/components/legal/legal-document.tsx](../src/frontend/components/legal/legal-document.tsx) |
| Cookie banner and Cookie settings | ✅ Built earlier | [src/frontend/components/site/cookie-consent.tsx](../src/frontend/components/site/cookie-consent.tsx) |

Both pages open without logging in and work on phones and desktop.

### Privacy Policy: 16 sections

1. Who we are
2. What we collect: account, business, connected Google data, booking data, public data, usage data, messages
3. How we use it
4. **Google user data**, including the Limited Use wording Google requires
5. AI features: AI writes text only, scores come from our own formulas, estimates are shown as ranges
6. Consent, and how to withdraw it
7. Who we share it with, by type of service
8. **Where it is stored**: main database in Canada, some providers in the US (cross-border notice)
9. How long we keep it: daily data 90 days, then weekly summaries; deletion within 90 days of closing an account
10. How we protect it, and breach notification
11. Cookies
12. Your rights: access, copy, correction, deletion, stop marketing
13. Making a request: Privacy Officer contact, answer within 30 days, complaints to the Privacy Commissioner or Quebec's CAI
14. Information about your customers: the business is responsible for having the right to share it
15. Children: not for anyone under 18
16. Changes to this policy

### Terms of Service: 15 sections

1. Agreement
2. The service
3. Your account
4. Free trial (14 days, no card), plans and billing, cancellation, 30 days' notice of price changes
5. Your data: the business owns it and can export or delete it
6. Connected services (Google, booking platforms)
7. AI content and estimates: drafts to review, estimates are not promises
8. Acceptable use: no fake reviews, no spam that breaks CASL, no scraping
9. Our intellectual property
10. Suspension and termination
11. Disclaimers
12. Limitation of liability (capped at 12 months of fees)
13. Governing law: Ontario
14. Changes to these Terms
15. Contact

---

## 3. Must do before launch

| # | Task | Details |
|---|---|---|
| 1 | **Fill in company details** | These show on the public pages as bracketed placeholders. They are all in one place: [legal.ts:6-13](../src/frontend/copy/legal.ts#L6-L13). Fields: company legal name, registered address, privacy email, support email, Privacy Officer name, province |
| 2 | **Lawyer review** | A Canadian lawyer should review both pages, especially liability, refunds, governing law and the Quebec sections |
| 3 | **Appoint a Privacy Officer** | Required by PIPEDA and Law 25. Their title and contact go in the Privacy Policy |
| 4 | **Accept-terms line on sign-up** | Add "By creating an account you agree to the Terms and Privacy Policy" with links, on [signup-form.tsx](../src/frontend/components/auth/signup-form.tsx) |
| 5 | **Marketing email checkbox on sign-up** | A **separate, unticked** box for marketing emails. CASL requires this, and we must record when and how consent was given |
| 6 | **Google OAuth setup** | Put the Privacy Policy and Terms URLs on the Google OAuth consent screen, and verify the domain. Google won't approve the app without this |
| 7 | **Check the "Data stored in Canada" claim** | The landing page says this. When Supabase is set up, the project must be in the Canadian region |
| 8 | **Email footer** | Every marketing email needs our company name, mailing address and a working unsubscribe link (CASL) |

---

## 4. Documents still needed

| Priority | Document | Why | Status |
|---|---|---|---|
| 🟠 Strongly advised | **Data Processing Agreement (DPA)** | Businesses upload their own customers' data. The DPA says what we may do with it. Larger customers will ask for one | ❌ Not started |
| 🟠 Strongly advised | **List of service providers** | Names the companies that process data (e.g. Supabase, Inngest, DataForSEO, Firecrawl, OpenAI, Resend, Stripe, Sentry, PostHog, Chatbase). The Privacy Policy lists them only by type now | ❌ Not started |
| 🟠 Strongly advised | **Messaging rules for review requests** | REYNAV will send review requests to our customers' customers. The business must have their consent under CASL | ❌ Not started (the Terms only cover spam in general) |
| 🟠 Strongly advised | **Accessibility statement** | AODA. Say what standard we follow (WCAG 2.1 AA) and how to report a problem | ❌ Not started |
| 🟡 If selling in Quebec | **French versions of the Terms and Privacy Policy** | Bill 96 requires offering standard contracts in French first | ❌ Not started |
| 🟡 Optional | **Refund policy page** | Refunds are covered in the Terms. A separate page is only needed if we want more detail | Covered in Terms |
| 🟡 Optional | **Acceptable Use Policy page** | Covered in the Terms. A separate page helps if the rules grow | Covered in Terms |
| 🟡 Optional | **Security page** | Explains how we protect data. Helps with sales to larger businesses | ❌ Not started |

---

## 5. Internal documents (not published)

| Document | Why | Status |
|---|---|---|
| **Breach log** | PIPEDA requires a record of **every** breach, even small ones, kept for 24 months | ❌ Not started |
| **Incident response plan** | Who does what if data is exposed, and how we notify people and the Privacy Commissioner | ❌ Not started |
| **Data retention schedule** | What we keep, for how long, and how it is deleted. The Privacy Policy promises 90 days | ❌ Not started |
| **Privacy impact assessments** | Law 25 requires one before sending Quebec residents' data outside Quebec, such as to US providers | ❌ Not started |
| **CASL consent records** | Proof of when and how each person agreed to marketing emails | ❌ Not started (needs the sign-up checkbox first) |
| **Contracts with service providers** | Each provider must agree to protect data. Most have standard DPAs to accept | ❌ Not started |

---

## 6. If the product changes, update the policies

The Privacy Policy describes how the product works today. Update it when:

- The booking upload starts accepting customer names, emails or phone numbers (it takes anonymous IDs only today)
- A new outside service is added
- REYNAV starts sending messages on a business's behalf (review requests, MVP2)
- Data is stored outside Canada
- Retention periods change
