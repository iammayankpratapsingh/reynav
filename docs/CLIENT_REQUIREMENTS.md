# AI Growth Manager: Client Requirements

_Source: "AI Growth Manager-Requirements_Draft.pdf" (client draft), converted to Markdown for readability. Wording is kept as written by the client._

> **Decision since this draft:** REYNAV is a generic product for all local businesses. Salons are the first vertical (pilot: Styloria), not the whole product. Where this draft says "salon", read it as the salon example of a vertical. See [PROJECT_RULES.md §3](../PROJECT_RULES.md#3-vertical-agnostic-design).

**Contents**

- [Functional requirements](#functional-requirements)
  1. [Differentiation from existing tools](#1-your-biggest-differentiation-from-other-existing-marketing-tools-such-as-uplift)
  2. [Booking Opportunities](#2-the-killer-feature-booking-opportunities)
  3. [Customer journey](#3-build-around-the-customer-journey)
  4. [Connect to the salon's systems](#4-your-platform-should-connect-to-the-salons-actual-systems)
  5. [Automatic analysis and onboarding](#5-ai-should-analyze-the-entire-salon-automatically)
  6. [Content engine](#6-your-ai-content-engine-should-be-salon-specific)
  7. [30-day growth plan](#7-the-ai-should-create-a-30-day-growth-plan-automatically)
  8. [Competitor AI](#8-the-competitor-ai-would-be-extremely-valuable)
  9. [Review AI](#9-review-ai)
  10. [Missed services](#10-ai-should-detect-missed-services)
  11. [Service Profitability × SEO](#11-build-a-service-profitability--seo-engine)
  12. [Simpler dashboard](#12-your-dashboard-should-be-radically-simpler)
- [MVPs](#mvps)
- [First MVP](#first-mvp)
- [Existing competitors to study](#existing-competitors-to-study)
- [Technical requirements](#technical-requirements)

---

## Functional requirements

**Search → Profile → Website → Service → Appointment → Customer → Review → Repeat booking**

So your architecture should be:

```
                 AI GROWTH ENGINE
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    DISCOVER         CONVERT          RETAIN
        │               │               │
   Google Maps       Website         Reviews
   Google Search     Booking         Rebooking
   ChatGPT           Offers          Referrals
   Instagram         Services        Loyalty
        │               │               │
        └───────────────┼───────────────┘
                        │
                     REVENUE
```

---

### 1. Your biggest differentiation from other existing marketing tools such as Uplift

Uplift currently serves many verticals: renovation, insurance, healthcare, events, ecommerce, immigration, etc.

You should go **much deeper** into one vertical.

For example, when a salon connects its website + Google Business Profile, your AI should automatically understand:

**Business**

- Salon
- Brampton
- Women's hair
- Men's hair
- Bridal
- Beauty
- Laser
- etc.

**Services**

Automatically identify:

- Haircut
- Balayage
- Highlights
- Hair colour
- Keratin
- Hair extensions
- Facials
- Waxing
- Threading
- Laser
- Bridal makeup

**Customer segments**

Automatically identify:

- Women
- Men
- Brides
- South Asian customers
- Families
- Teens
- Professionals
- etc.

Then build the entire marketing strategy around those.

---

### 2. The killer feature: "Booking Opportunities"

This is what I would make the **centerpiece of the product**.

Instead of showing:

> Keyword: "balayage Brampton"
> Search volume: 720
> Difficulty: 42

Show:

> **Booking Opportunity**
>
> **Balayage — Brampton**
>
> Estimated monthly searches: **720**
> Your ranking: **#18**
> Competitor ranking: **#2**
> Estimated missed bookings: **18–32/month**
> Potential monthly revenue: **$2,700–$4,800**
>
> **AI recommendation**
> Create a dedicated Balayage Brampton landing page, add 8 portfolio images, add 5 FAQs, improve internal links and publish 3 Google Business posts.
>
> **[Fix this for me]**

That's dramatically easier for a salon owner to understand.

---

### 3. Build around the customer journey

Your platform should understand that a salon doesn't just want traffic.

It wants:

**Search → Profile → Website → Service → Appointment → Customer → Review → Repeat booking**

So your architecture should be the **Discover → Convert → Retain → Revenue** engine shown at the top of this document.

This is where you can go beyond Uplift.

---

### 4. Your platform should connect to the salon's actual systems

This is **very important**.

Don't just connect:

- WordPress
- Shopify
- Google Business

like Uplift does.

You should connect to salon booking platforms. For example:

- Fresha
- Vagaro
- Boulevard
- Mindbody
- Square Appointments
- Jane
- Phorest
- GlossGenius
- Booksy
- Treatwell
- Zenoti
- Square
- custom booking systems

Then your dashboard can say:

> **SEO generated 47 website visits → 13 booking-page visits → 6 appointments → $842 estimated revenue.**

Now you aren't selling **SEO**. You're selling **revenue growth**.

---

### 5. AI should analyze the entire salon automatically

When Styloria signs up, the onboarding could be:

| Step | Action |
|---|---|
| 1 | Enter: `www.thestyloria.ca` |
| 2 | Connect: Google Business Profile |
| 3 | Connect: Google Search Console |
| 4 | Connect: Google Analytics |
| 5 | Connect: Booking software |
| 6 | AI scans everything |

Within a few minutes:

**Your Salon Growth Score: 72/100**

| Sub-score | Score |
|---|---|
| Visibility | 78/100 |
| Google Maps | 81/100 |
| Website SEO | 62/100 |
| AI Search | 43/100 |
| Reviews | 89/100 |
| Conversion | 67/100 |

Then it shows:

**Your top 5 opportunities**

1. **Balayage** — High demand / low visibility
2. **Hair Colour** — Competitors outperform you
3. **Bridal Makeup** — High-value search opportunity
4. **Google reviews** — Need more service-specific reviews
5. **Website conversion** — Booking button isn't prominent enough

---

### 6. Your AI Content Engine should be salon-specific

Don't just build an AI blog writer. Build a **Salon Content Engine**.

It generates:

**Website**

- Service pages
- Location pages
- FAQs
- Before/after descriptions
- Stylist profiles
- Pricing explanations
- Treatment guides

**Google**

- Google Business Posts
- Review responses
- Q&A suggestions
- Service descriptions
- Offer posts

**Social**

- Instagram captions
- Reels scripts
- TikTok scripts
- Facebook posts

**AI Search**

Content specifically structured so ChatGPT/Gemini/Perplexity can understand:

> "Who is the best balayage salon in Brampton?"

Uplift already tracks AI mentions/citations across ChatGPT, Perplexity, Claude, Gemini and Google AI.

You should take that concept and make it **service + location specific**.

---

### 7. The AI should create a 30-day growth plan automatically

Uplift already has a 30-day keyword calendar. You should make yours much more actionable.

Example:

**Styloria — September Growth Plan**

**Week 1**

| Day | Task |
|---|---|
| Monday | Fix Balayage page |
| Tuesday | Upload 10 balayage photos |
| Wednesday | Google Post: Balayage transformation |
| Thursday | Request reviews from 10 balayage customers |
| Friday | Publish "Balayage vs Highlights" article |
| Saturday | Instagram Reel |
| Sunday | AI visibility check |

**Week 2:** Hair colour
**Week 3:** Keratin
**Week 4:** Bridal

Everything should be automatically prioritized based on:

> **Search demand × competition × conversion × average service value × current ranking**

That's much more sophisticated than simply generating content.

---

### 8. The "Competitor AI" would be extremely valuable

Give the salon **Competitor Intelligence**.

Automatically monitor 10 nearby competitors. For each competitor:

- Google rating
- review count
- review growth
- services
- prices where available
- website pages
- Google posts
- photos
- keywords
- Maps ranking
- backlinks
- social activity
- AI recommendations

Then:

> **Your competitor added 17 new reviews this month.**
> **Competitor X is ranking #2 for "balayage Brampton."**
> **They have a dedicated balayage page. You don't.**
> **They published 8 Google Posts this month. You published 1.**

And then: **Fix it**. One click.

---

### 9. Review AI

This should be much deeper than Uplift.

After a customer completes an appointment, **AI generates:**

> "Thanks for visiting Styloria! If you enjoyed your balayage experience with Sarah, we'd love to hear about your experience."

Then when the review arrives, **AI automatically analyzes:**

| Field | Value |
|---|---|
| Service | Balayage |
| Stylist | Sarah |
| Sentiment | Positive |
| Location | Brampton |
| Topic | Colour transformation |

Then your dashboard becomes:

**Customer reputation**

| Service | Rating |
|---|---|
| Balayage | ★★★★★ |
| Hair colour | ★★★★★ |
| Keratin | ★★★★½ |
| Bridal | ★★★★★ |

Now you know exactly where the business is strong or weak.

---

### 10. AI should detect missed services

This is another killer feature.

Suppose the salon offers **Nanoplastia** but only has:

- 2 website mentions
- no dedicated page
- 3 Google reviews
- no Google posts
- no AI citations

The system says:

> **Under-marketed service**
>
> **Nanoplastia**
> Potential opportunity: **HIGH**
>
> Recommended actions:
> - [x] Create service page
> - [x] Add pricing range
> - [x] Add FAQ
> - [x] Add before/after photos
> - [x] Generate Google Post
> - [x] Request reviews
> - [x] Add internal links
> - [x] Create Instagram content
>
> **[Launch Campaign]**

---

### 11. Build a "Service Profitability × SEO" engine

This could be your **secret weapon**.

Ask the owner:

- Average price?
- Average appointment duration?
- Gross margin?

Then AI calculates the **Opportunity Score**:

| Service | Search | Competition | Price | Opportunity |
|---|---|---|---|---|
| Balayage | High | Medium | $250 | **94** 🔥 |
| Keratin | Medium | Medium | $220 | **89** 🔥 |
| Haircut | Very High | High | $60 | 71 |
| Bridal | Medium | Low | $500 | **96** 🔥 |
| Threading | High | High | $20 | 48 |

Now the AI doesn't chase traffic. It chases **profitable bookings**.

That is a much better product.

---

### 12. Your dashboard should be radically simpler

```
Good Morning, Styloria

Growth Score
82 / 100

Google Visibility      ↑ 14%
AI Visibility          ↑ 22%
Website SEO            74%
Reviews                91%
Booking Conversion     68%

──────────────────

5 Opportunities

1. Balayage
2. Hair Colour
3. Keratin
4. Bridal
5. Hair Extensions

──────────────────

Recommended Today

[Fix Balayage Page]
[Create Google Post]
[Request Reviews]
```

---

## MVPs

We will build the product in three MVPs:

| MVP | Focus |
|---|---|
| **First MVP** | SEO / Growth Intelligence |
| **Second MVP** | AI Marketing Automation |
| **Third MVP** | Booking + Revenue Intelligence |

---

## First MVP

For this pilot launch we will start with the first MVP, and focus on **five things**:

1. **Business Intelligence** — understand the salon / other business.
2. **Search/Competitor Intelligence** — find missed demand.
3. **Customer Intelligence** — find customers likely to return/buy more.
4. **AI Recommendations** — tell the owner what to do.
5. **Revenue Attribution** — prove whether it worked.

### First MVP should be built around 5 data sources

| # | Source | Question it answers |
|---|---|---|
| 1 | Website | What does the salon sell? |
| 2 | Google Business | How visible is it? |
| 3 | Google Search Console | What searches bring people? |
| 4 | Competitors | Who is beating it? |
| 5 | Booking/revenue | What actually makes money? |

Then: **AI combines all five.** That's your core intelligence layer.

Then in later MVPs add automated execution:

> **AI finds opportunity → AI creates campaign → AI executes → booking happens → revenue is measured.**

---

## Existing competitors to study

Look around at these tools for their features and how they work:

| Rank | Tool | Best for Styloria | Rating |
|---|---|---|---|
| 1 | Semrush Local | Google Maps + GBP + local SEO | ★★★★★ (5) |
| 2 | Uplift AI | Automated SEO/content workflow | ★★★★½ (4.5) |
| 3 | SE Ranking | SEO + competitor/rank tracking | ★★★★ (4) |
| — | Semrush AI Visibility | ChatGPT/Gemini/Perplexity visibility | ★★★★ (4) |
| — | Full Semrush SEO | Advanced SEO + competitors + AI | ★★★★½ (4.5) |

---

## Technical requirements

### Technology stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js | Huge ecosystem, modern SaaS standard |
| Language | TypeScript | Easier transition from your Microsoft background |
| UI | Tailwind CSS + shadcn/ui | Fast, professional UI |
| Database | PostgreSQL / Supabase | Simple initially, scales significantly |
| Authentication | Supabase Auth | Don't build authentication yourself |
| Backend | Next.js server/API | Avoid separate backend initially |
| AI | OpenAI API | Excellent AI ecosystem |
| AI agents | OpenAI Responses API | Tool/function calling, web/file capabilities |
| Hosting | Vercel | Extremely easy Next.js deployment |
| Analytics | PostHog | Product analytics |
| Error monitoring | Sentry | Production monitoring |
| Payments | Stripe | SaaS subscriptions |
| Code | GitHub | Version control |
| Development | Cursor | AI-assisted coding |
| Design | Figma | UI/UX |

### Architecture

```
                        USER
                          │
                          ▼
                   ┌──────────────┐
                   │   Next.js    │
                   │  Web App/UI  │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      Supabase         OpenAI        External APIs
          │               │               │
      PostgreSQL      AI Agents        Google
      Auth            Content          Search
      Storage         Analysis         Analytics
                      Planning         Booking
                          │
                          ▼
                    Growth Engine
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
         SEO          Local SEO       AI Search
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                    Opportunities
                          │
                          ▼
                       ACTIONS
                          │
                  ┌───────┴───────┐
                  ▼               ▼
               Website          Google
               Content          Business
                  │               │
                  └───────┬───────┘
                          ▼
                       BOOKINGS
                          │
                          ▼
                       REVENUE
```

### Make the architecture multi-business and multi-location from Day 1

```
organizations
 │
 ├── users
 │
 ├── businesses
 │    │
 │    ├── locations
 │    ├── services
 │    ├── staff
 │    └── competitors
 │
 ├── websites
 ├── SEO audits
 ├── keywords
 ├── AI queries
 ├── content
 ├── campaigns
 ├── bookings
 └── reports
```

That way:

- **Styloria = Organization 001**
- Later: **Salon ABC = Organization 002**
- **Salon XYZ = Organization 003**

Same application.

### And design for multiple locations

Don't make `business.address` your only location.

Make:

```
business
   ↓
locations
   ↓
location 1
location 2
location 3
```

Because eventually a salon owner will say:

> "I have 5 locations."

Your platform should handle that without rebuilding the database.
