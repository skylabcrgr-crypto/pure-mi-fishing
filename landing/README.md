# Pure MI Fishing — Landing Page

> Premium marketing site for the Pure MI Fishing independent Michigan fishing app.

Built with Next.js 16 App Router, Tailwind CSS v4, Framer Motion, and lucide-react. Static output — no backend, no paid APIs.

---

## Quick Start

```bash
cd landing
npm install
npm run dev
```

Opens at `http://localhost:3000`.

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | ESLint check |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Animations | Framer Motion v12 |
| Icons | lucide-react |
| Font | Geist (via `next/font/google`) |
| Rendering | Static (SSG) |

---

## Page Structure

10 sections, 11 component files:

```
app/
  layout.tsx              SEO metadata, Open Graph, canonical URL
  globals.css             Tailwind v4 + glass/grid/dot utilities
  page.tsx                Composes all 10 sections
  _components/
    Nav.tsx               Sticky scroll-aware nav with mobile drawer
    Hero.tsx              Full-viewport cinematic hero, animated water rings
    ProblemSection.tsx    5 problem cards + solution card
    ProductSection.tsx    8 feature cards, 4-col grid
    DetroitSection.tsx    6 Detroit River region cards with GPS coords
    AppPreviewSection.tsx Interactive CSS phone mockups (5 screens)
    OfflineSection.tsx    6 offline features + 3 pack cards
    LicenseSection.tsx    License price grid + official DNR CTA
    TrustSection.tsx      6 trust cards + disclaimer panel
    CtaSection.tsx        Early access waitlist section
    Footer.tsx            4-column links, repeated disclaimer
```

---

## SEO

**Title:** Pure MI Fishing — Michigan Fishing App | Detroit River Offline Maps & Regulations

**Target keywords:**
- Michigan fishing app
- Detroit River fishing map
- offline fishing maps Michigan
- Michigan fishing regulations
- Detroit River walleye fishing
- Michigan boat launches
- fishing license Michigan
- Michigan fishing conditions
- ice fishing Michigan
- spearfishing Michigan

---

## Deployment

Deploy to Vercel with zero config:

```bash
npm run build   # verify clean build first
```

Then connect the `landing/` directory as the Vercel project root, or use the monorepo root with `landing` as the root directory in Vercel settings.

---

## Legal

This landing page and associated app are **not affiliated with** the State of Michigan, Michigan DNR, or the Pure Michigan tourism campaign.
All regulation references link to official sources at michigan.gov/dnr.

