# Pure MI Fishing — Brand Guide

> Version 1.0 · June 2026 · Skylab Creative Group

---

## Product Identity

### Name
**Pure MI Fishing**

- Always written as three words: **Pure MI Fishing**
- Never: "PureMI", "Pure Michigan Fishing", "Pure Michigan Fishing App", "MI Fishing"
- The "MI" is always uppercase — it is the USPS abbreviation for Michigan, not a stylized mark

### Taglines

**Primary:**
> "Fish Michigan Smarter — Even When Service Drops."

**Secondary (use in shorter contexts):**
> "Michigan fishing maps, rules, launches, and trip tools — built for the water."

**Tertiary (compliance/trust contexts):**
> "Independent field companion. Official source links always included."

**Pitch-deck one-liner:**
> "Offline-first Michigan fishing companion — starting with the Detroit River."

---

## Brand Positioning

Pure MI Fishing sits at the intersection of **civic tech** and **premium outdoors gear** — think Gaia GPS meets a well-designed government service.

| Dimension | Position |
|---|---|
| Primary user | Michigan freshwater anglers, recreational and serious |
| First region | Detroit River corridor and SE Michigan access |
| Competitive frame | Not a tackle store. Not a social platform. A field intelligence tool. |
| Independence | Explicitly not a government app. Independently built. |
| Trust signal | Official sources always cited and linked. Stale-data warnings visible. |
| Business model (MVP) | Free early access. Future: one-time purchase or premium tier. |

---

## ⚠️ Forbidden Assets and Language

The following must **never** appear in any Pure MI Fishing materials — app, landing page, social, pitch deck, or press:

| Forbidden | Reason |
|---|---|
| Official State of Michigan seal or coat of arms | Protected government mark |
| Michigan Department of Natural Resources (DNR) logo | Protected agency mark |
| "Pure Michigan" wordmark or logo | Registered tourism campaign mark (Travel Michigan) |
| Any icon, image, or layout that implies government authority | Creates false affiliation |
| Language such as "Official Michigan fishing app" | Implies government ownership |
| Language such as "State-approved" or "DNR-certified" | False claim |
| Copying verbatim regulation text without linking to the authoritative source | Creates false legal authority |

**Required disclaimer (use in full on Hero, Trust section, Footer, and in-app onboarding):**
> "Pure MI Fishing is an independent app. Not affiliated with or endorsed by the State of Michigan, Michigan Department of Natural Resources, or the Pure Michigan tourism campaign."

---

## Color Palette

Pure MI Fishing uses an unofficial state-inspired palette drawn from Michigan's natural landscape: deep winter rivers, spruce forests, sand beaches, and Great Lakes water.

### Primary — Dark UI (Mobile App)

| Name | Hex | Usage |
|---|---|---|
| **Navy 950** | `#050f1d` | App background, deepest layer |
| **Navy 900** | `#071222` | Section backgrounds |
| **Navy 800** | `#0a1628` | Card backgrounds, surfaces |
| **Navy 700** | `#0d1f3c` | Elevated cards |
| **Navy 600** | `#162540` | Borders, dividers |

### Brand Accents

| Name | Hex | Usage |
|---|---|---|
| **Freshwater Teal** | `#00acc1` | Primary brand accent, icons, links |
| **Teal Light** | `#4fc3f7` | Text accents, small chips |
| **Teal Pale** | `#67e8f9` | Hero gradient highlight |
| **Michigan Blue** | `#003da5` | License CTA, Michigan-adjacent UI |
| **Michigan Blue Mid** | `#1565c0` | Secondary buttons, hover states |
| **Safety Orange** | `#ff6b35` | Primary CTA, active filter chips, alerts |
| **Orange Warm** | `#ff8c00` | CTA hover state |
| **Forest Green** | `#1b4332` | Light backgrounds, eco sections |
| **Forest Mid** | `#2d6a4f` | Forest accents |
| **Sand** | `#f5f5f0` | Light section background |
| **Sand Deep** | `#ede8df` | Alternate light surface |
| **Gold / Amber** | `#cda323` | License/premium accents, sand tones |

### Text — Dark UI

| Name | Hex | Usage |
|---|---|---|
| **Text Primary** | `#f0f9ff` | Headlines, primary body |
| **Text Secondary** | `#8fb4cc` | Supporting body copy |
| **Text Muted** | `#3d6070` | Captions, metadata |
| **Text Accent** | `#4fc3f7` | Teal text links |
| **Text Danger** | `#f44336` | Errors, emergency |

### Map Pins

| Type | Hex |
|---|---|
| Launch | `#00acc1` (teal) |
| Hotspot | `#ff6b35` (orange) |
| Shore Access | `#4caf50` (green) |
| Hazard | `#f44336` (red) |

---

## Typography

### Mobile App (React Native)

- **System font** via React Native defaults — no custom font bundle in MVP
- Scale defined in `src/design/tokens.ts`:

| Token | Size | Weight | Usage |
|---|---|---|---|
| `displayLg` | 32px | 800 | Screen headlines |
| `displayMd` | 26px | 700 | Section titles |
| `titleLg` | 20px | 700 | Card titles |
| `titleMd` | 17px | 600 | List items, labels |
| `titleSm` | 15px | 600 | Small card titles |
| `bodyLg` | 16px | 400 | Body copy |
| `bodyMd` | 14px | 400 | Standard body |
| `bodySm` | 13px | 400 | Secondary body |
| `label` | 12px | 600 | Chips, badges, overlines |
| `caption` | 11px | 400 | Timestamps, metadata |
| `overline` | 10px | 700 | Section overlines, ALL CAPS |

### Landing Page (Web)

- **Geist** (via `next/font/google`) — Vercel's humanist sans-serif
- Headlines: `font-extrabold` (800), tight tracking (`tracking-tight`), `leading-[1.06]`
- Body: `font-normal` (400), relaxed leading (`leading-relaxed`)
- Overlines: `font-bold`, `uppercase`, `tracking-widest` (0.1em)

---

## UI Tone and Visual Style

### Mobile App

- **Dark-first.** Primary UI is deep navy. Light sections are used only for overlapping map areas.
- **Glassmorphism cards.** `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(20px)`, thin white border at 7% opacity.
- **Large tap targets.** Minimum 44×44pt (Apple HIG). Trip Mode uses 56pt+ for gloved use.
- **Haptic feedback** on all primary CTAs, form submits, and list deletes.
- **Safety orange** for all primary actions (Start Trip, Download Pack, Submit Catch).
- **Teal** for informational accents (conditions, map pins, offline status).
- **Status badges** always visible in trip mode: offline indicator, GPS accuracy.

### Landing Page

- **Cinematic hero.** Full viewport, dark navy, animated water-ring concentric circles.
- **Section rhythm.** Dark → light → dark alternation for contrast and breathing room.
- **Framer Motion.** `whileInView` scroll triggers with stagger on card grids.
- **No external images.** All visuals are CSS gradients, SVG paths, and emoji. Zero image requests.
- **Phone mockups.** Interactive CSS phone frames with live screen switching.

---

## Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Color contrast | All text/bg combos meet WCAG AA (4.5:1 for body, 3:1 for large text) |
| Touch targets | Minimum 44×44pt on all interactive elements |
| `accessibilityLabel` | All buttons, icons, and map markers have labels |
| `accessibilityRole` | Buttons, images, and headings use correct roles |
| `accessibilityHint` | Destructive actions include hints |
| Semantic HTML | Landing page uses `h1`→`h2`→`h3` hierarchy, `<nav>`, `<main>`, `<footer>`, `<article>` |
| `aria-label` | All icon-only buttons labeled |
| `focus-visible` | All interactive elements have visible keyboard focus rings |
| Reduced motion | Framer Motion respects `prefers-reduced-motion` via `useReducedMotion()` hook (future) |
| Screen reader map | MapView has `accessibilityLabel="Detroit River fishing map"` |

---

## Voice and Copy Guidelines

### Tone

| Voice quality | Example |
|---|---|
| **Practical** | "Tap any pin to see launch details." — not "Explore the rich tapestry of Michigan's waterways." |
| **Honest** | "Regulations shown here are simplified. Always verify at michigan.gov/dnr." |
| **Confident** | "Built for real days on the water." — not "Designed to potentially help you maybe fish better." |
| **Brief** | One sentence per card body. No padding sentences. |
| **Non-governmental** | "Pure MI Fishing" — never "the official app" or "state-approved." |

### Copy Rules

1. **Always disclaim.** Every regulation reference must say it is a planning summary, not official legal text.
2. **Always link out.** Every regulation section must link to `michigan.gov/dnr`.
3. **Never claim affiliation.** No language that implies endorsement by the State of Michigan, DNR, or Pure Michigan.
4. **Offline-first language.** Lead with offline capability. "Works without signal" is a primary feature, not a footnote.
5. **User-centric headings.** Headlines should answer "what does this do for me?" — not describe the feature abstractly.
6. **Short sentences on mobile.** 12–16 words maximum per sentence in app copy.
7. **No jargon.** Avoid "geospatial data layer" or "API endpoint." Say "offline map" and "regulations summary."

### Approved Phrases

- "Independent Michigan fishing companion"
- "Offline-ready maps"
- "Simplified regulation summaries"
- "Official source links always included"
- "Detroit River fishing access"
- "Built for real days on the water"
- "Works without cell service"

### Phrases to Avoid

- "Official" (without "source" or "DNR" — e.g. "Official Michigan fishing app" is forbidden)
- "Authorized by" / "Approved by"
- "Pure Michigan" (the tourism mark)
- "State of Michigan fishing app"
- "DNR-endorsed"
- "Guaranteed accuracy" (regulations change; accuracy cannot be guaranteed)
