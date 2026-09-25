# MVP1 Status: What's Left and Which APIs We Need

_Last checked: 2026-09-25 · Pilot: Styloria_

## TL;DR

The app works from start to finish, but **only on simulated data**.

- `USE_MOCK_DATA=true` (the default) makes every provider return fake data. Nothing leaves the server.
- The database is **in memory** ([src/backend/db/client.ts](src/backend/db/client.ts)), so it is wiped every time the server restarts.
- Every "real" provider file under [src/backend/adapters/](src/backend/adapters/) is an **empty stub**: a 2-line comment, or a class that throws `not implemented`.

The good news is that the architecture is ready. Each capability sits behind an adapter with a `types.ts` interface, a `mock.ts` and a contract test. Going live means filling in the real adapter, adding its keys to [config](src/backend/config/index.ts), and switching the provider env var. **Nothing above the adapter or repository layer has to change.**

---

## 1. APIs we need

| # | Capability | API / service | Adapter file to implement | Env vars needed | Unblocks | Priority |
|---|---|---|---|---|---|---|
| 1 | Database | **Supabase Postgres** | [db/client.ts](src/backend/db/client.ts) + `db/repositories/*` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Everything (data survives restarts) | 🔴 P0 |
| 2 | Login / signup | **Supabase Auth** | [identity-provider/supabase-auth.ts](src/backend/adapters/identity-provider/supabase-auth.ts) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PROVIDER_IDENTITY=supabase-auth` | A2, real accounts | 🔴 P0 |
| 3 | File storage | **Supabase Storage** (or any S3-compatible store) | [file-storage/s3-compatible.ts](src/backend/adapters/file-storage/s3-compatible.ts) | bucket name + keys | CSV uploads kept | 🔴 P0 |
| 4 | Website crawl | **Firecrawl** | [web-crawler/firecrawl.ts](src/backend/adapters/web-crawler/firecrawl.ts) | `FIRECRAWL_API_KEY`, `PROVIDER_WEB_CRAWLER=firecrawl` | B1, C1–C4, website SEO score | 🔴 P0 |
| 5 | Google sign-in for data (OAuth) | **Google Cloud OAuth client** | [connection-authorizer/oauth.ts](src/backend/adapters/connection-authorizer/oauth.ts) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (already in `.env.example`) | B2, B3, B4 | 🔴 P0 |
| 6 | Business listing + reviews | **Google Business Profile API** (needs Google approval, apply early) | [local-listing/google-business-profile.ts](src/backend/adapters/local-listing/google-business-profile.ts) | Google OAuth (above), `PROVIDER_LOCAL_LISTING=google-business-profile` | B2, E3, E4, Maps sub-score | 🔴 P0 |
| 7 | Search clicks / queries | **Google Search Console API** | [search-performance/google-search-console.ts](src/backend/adapters/search-performance/google-search-console.ts) | Google OAuth, `PROVIDER_SEARCH_PERFORMANCE=google-search-console` | B3, D2, G1 | 🟠 P1 |
| 8 | Site visits / funnel | **Google Analytics 4 Data API** | [web-analytics/google-analytics.ts](src/backend/adapters/web-analytics/google-analytics.ts) | Google OAuth, `PROVIDER_WEB_ANALYTICS=google-analytics` | B4, G1 | 🟠 P1 |
| 9 | Keyword volume + difficulty | **DataForSEO** (Keywords Data / Labs) | [search-demand/dataforseo.ts](src/backend/adapters/search-demand/dataforseo.ts) | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | D1, D3, D8 | 🔴 P0 |
| 10 | Search + Maps rankings | **DataForSEO** (SERP + Google Maps) | [rank-tracker/dataforseo.ts](src/backend/adapters/rank-tracker/dataforseo.ts) | same as above | D2, D3 | 🔴 P0 |
| 11 | Nearby competitors | **DataForSEO** (Business Data / Maps) | [competitor-directory/dataforseo.ts](src/backend/adapters/competitor-directory/dataforseo.ts) | same as above | B6, D4, D5 | 🔴 P0 |
| 12 | AI search visibility | **DataForSEO AI Optimization** (or direct ChatGPT / Gemini / Perplexity APIs) | [ai-visibility/dataforseo.ts](src/backend/adapters/ai-visibility/dataforseo.ts) | same as above | D6, AI Search sub-score | 🟠 P1 |
| 13 | AI text + extraction | **OpenAI Responses API** | [language-model/openai.ts](src/backend/adapters/language-model/openai.ts) | `OPENAI_API_KEY` | A6, better C1–C4, E3, F3 wording | 🟠 P1 |
| 14 | Booking data (live) | **Square Bookings API** first; Fresha / Vagaro later (their public API access is limited) | [booking-source/square.ts](src/backend/adapters/booking-source/square.ts) | `SQUARE_APPLICATION_ID`, `SQUARE_APPLICATION_SECRET` | B5, E1, G1–G3 | 🟡 P2 (CSV works today) |
| 15 | Background jobs | **Inngest** | [job-runner/inngest.ts](src/backend/adapters/job-runner/inngest.ts) | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Scans, nightly sync, weekly rescan | 🔴 P0 |
| 16 | Email | **Resend** | [email-sender/resend.ts](src/backend/adapters/email-sender/resend.ts) | `RESEND_API_KEY` | Weekly reports, invites | 🟡 P2 |
| 17 | Error tracking | **Sentry** | [error-reporter/sentry.ts](src/backend/adapters/error-reporter/sentry.ts) | `SENTRY_DSN` | A7 | 🟠 P1 |
| 18 | Product analytics | **PostHog** | ❌ no adapter yet | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | A7 | 🟡 P2 |
| 19 | Billing | **Stripe** (subscriptions) | ❌ no adapter yet | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | A7 | 🟡 P2 (a free pilot doesn't need it) |

> **The CSV booking import already works for real.** It is the fallback for B5 and E1 until a live booking API is connected.

### Accounts to create
- [ ] Supabase project (database, login, storage)
- [ ] Google Cloud project with an OAuth consent screen, Business Profile API **access request**, Search Console API and Analytics Data API
- [ ] DataForSEO account (pay as you go)
- [ ] Firecrawl
- [ ] OpenAI
- [ ] Inngest
- [ ] Sentry, PostHog, Resend, Stripe
- [ ] Square developer account

---

## 2. Feature checklist

**Key:** ✅ built (logic + screen, currently on fake data) · 🟡 partly built · ❌ not built

### A. Foundation
| # | Feature | Status | What's remaining |
|---|---|---|---|
| A1 | Next.js + TS, Tailwind + shadcn/ui | 🟡 | Uses CSS modules. Decide: adopt Tailwind/shadcn or keep CSS modules |
| A2 | Supabase | 🟡 | Only the SQL migrations exist. Wire the Postgres client and Auth |
| A3 | Multi-tenant | ✅ | Tested for tenant isolation. Needs Postgres behind it |
| A4 | Multi-location | ✅ | — |
| A5 | Tables | 🟡 | Missing tables: **staff, websites, seo_audits, keywords, content, campaigns, reports** |
| A6 | OpenAI | ❌ | Adapter is empty and no service calls a model |
| A7 | PostHog, Sentry, Stripe | ❌ | Nothing is wired |

### B. Onboarding
| # | Feature | Status | What's remaining |
|---|---|---|---|
| B1 | URL + crawl | 🟡 | Firecrawl adapter |
| B2 | Google Business Profile | 🟡 | Screen and routes exist. Needs the OAuth and GBP adapters |
| B3 | Search Console | 🟡 | Needs the OAuth and GSC adapters |
| B4 | Google Analytics | 🟡 | Needs the OAuth and GA4 adapters |
| B5 | Booking software / CSV | 🟡 | CSV ✅. Live Square adapter is empty |
| B6 | Competitor discovery | 🟡 | DataForSEO adapter |
| B7 | "AI scans everything" progress | ✅ | 12-step scan with a progress screen |

### C. Business Intelligence
| # | Feature | Status | What's remaining |
|---|---|---|---|
| C1–C4 | Business type, categories, services, segments | ✅ | Works from crawl data, so it needs the real crawler (and OpenAI for better extraction) |
| C5 | Price / duration / margin inputs | ✅ | — |

### D. Search / Competitor Intelligence
| # | Feature | Status | What's remaining |
|---|---|---|---|
| D1 | Keyword volume / difficulty | 🟡 | DataForSEO |
| D2 | Your rank vs competitors | ✅ | Needs real rank data |
| D3 | Booking Opportunity cards | ✅ | — |
| D4 | Competitor monitoring | 🟡 | Missing fields: **prices, competitor keywords, backlinks, social** |
| D5 | Competitor insights | ✅ | — |
| D6 | AI Search visibility | 🟡 | Real provider |
| D7 | Under-marketed services | ✅ | — |
| D8 | Opportunity Score | ✅ | Tested |

### E. Customer Intelligence
| # | Feature | Status | What's remaining |
|---|---|---|---|
| E1 | Import customers / appointments | ✅ | Through CSV |
| E2 | Customers likely to return / buy more | ❌ | **Not built** |
| E3 | Review analysis | 🟡 | Sentiment is based on stars and topics on keywords. Consider OpenAI. Reviews are fake until GBP is connected |
| E4 | Service-level reputation | ✅ | — |

### F. AI Recommendations
| # | Feature | Status | What's remaining |
|---|---|---|---|
| F1 | Growth Score + 6 sub-scores | ✅ | — |
| F2 | Top 5 opportunities | ✅ | — |
| F3 | Per-opportunity actions | ✅ | Text comes from templates. OpenAI could make it more specific |
| F4 | Recommended Today | ✅ | — |
| F5 | 30-day plan | ✅ | — |

### G. Revenue Attribution
| # | Feature | Status | What's remaining |
|---|---|---|---|
| G1 | Funnel | ✅ | Needs real GA4 and booking data |
| G2 | Revenue estimate | ✅ | — |
| G3 | Before/after tracking | ✅ | — |

### H. Dashboard
| # | Feature | Status | What's remaining |
|---|---|---|---|
| H1 | Home dashboard | ✅ | — |

---

## 3. Suggested order

1. **Supabase**: database, login, storage (nothing is saved until this is done)
2. **Inngest**: so scans run as real background jobs
3. **Firecrawl + DataForSEO**: gives a real scan with no customer login needed
4. **Google OAuth → Business Profile → Search Console → Analytics** (submit the GBP access request on day 1; approval takes time)
5. **OpenAI**: extraction, review analysis, recommendation wording
6. **Sentry**, then **Resend**
7. **Build what's missing:** E2 (returning customers), D4 extra fields, A5 missing tables
8. **Square**, **PostHog**, **Stripe**

## 4. How to switch a provider from fake to real

1. Implement the real adapter file so it satisfies its `types.ts` interface.
2. Add its keys to [src/backend/config/index.ts](src/backend/config/index.ts) and `.env.example`.
3. Update that capability's `index.ts` factory to return the real adapter when the provider env var selects it.
4. Run the adapter's `contract.test.ts` against the real implementation.
5. Set `USE_MOCK_DATA=false` and the matching `PROVIDER_*` variable.
