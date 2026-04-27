# Furniture Catalog & WhatsApp Inquiry Platform — PRD

> **Version:** 2.0 (post Q&A — execution-ready)
> **Owner:** user@befach.com
> **Last updated:** 2026-04-27
> **Status:** Planning complete → ready to execute

---

## 1. Product Overview

A B2B furniture catalog website where designers, architects, hotels, and contractors browse SKUs and inquire **directly via WhatsApp** with full product context auto-attached.

**Goal:** replace manual catalog sharing (PDFs over email/WhatsApp) with a live, browsable, mobile-friendly catalog that funnels every inquiry into your WhatsApp inbox with the SKU pre-filled.

**Critical path:** ship fast → get inquiries flowing → polish later.

---

## 2. Audience

- **Primary (now):** B2B — interior designers, architects, hotels, restaurants, retailers, contractors. Indian market.
- **Secondary (future):** B2C homeowners. Schema and routing future-proofed; no UI surfaced at launch.
- **Suppliers:** sourced globally (China, Italy, Vietnam, etc.), hidden from public.

---

## 3. Goals & Non-Goals

### Goals
- Public catalog browsing with search + category filter
- Frictionless WhatsApp inquiry with product context auto-attached
- Click-tracking to admin dashboard (so you know which products convert)
- Admin can edit any product post-launch without redeploying
- Mobile-first, fast (LCP < 2.5s on 4G), HTTPS, custom domain

### Non-Goals (for v1)
- Online checkout / payments
- Customer accounts
- Real-time chat widgets
- Multi-language UI
- WhatsApp Business API automation
- Master PDF auto-extraction (deferred to Phase 9)
- Public pricing
- Newsletter signup
- Showroom locator
- Series/Suppliers/Categories admin CRUD UIs (managed via Supabase Studio for v1)
- Trash/restore UI (soft delete is in DB, no UI yet)
- Settings page (WhatsApp # via env var; redeploy to change)

---

## 4. Key Decisions Locked

| Area | Decision |
|---|---|
| Audience | B2B-first, B2C reserved |
| Geography | India primary; global suppliers |
| Currency | INR (hidden — not shown publicly) |
| Language | English only |
| Brand | Deferred — neutral defaults, swappable via `lib/brand.ts` |
| Inquiry mechanism | **WhatsApp deeplink only** — no forms, no email, no DB inquiry table |
| Tracking | `enquiry_clicks` table + `/api/track-click` POST |
| Pricing | Public **hidden**; price field exists in DB for B2C later |
| Categories | 2-level (parent → sub), 6 starter categories seeded |
| Series | Real routes at `/collections/[slug]` |
| Project types | Filter params only: `/products?project=hospitality` |
| Suppliers | Hidden from public; admin-only |
| Country of origin | Public (e.g. "Made in China") |
| Product description | AI-generated (Claude Haiku), admin-editable |
| Image strategy | Sharp resize on upload to 3 sizes (400/800/1600), AVIF+WebP via `next/image` |
| Performance | LCP < 2.5s, TTI < 4.0s on 4G |
| Animation | Moderate; respects `prefers-reduced-motion` |
| Auth | Supabase Auth, email+password, closed signup, 30-day sessions, no MFA |
| Admin URL | `/admin` |
| Hosting | Vercel + Supabase (region: ap-south-1 / Mumbai) |
| Legal | Privacy + Terms + Contact (1-pager templates) |
| Cookie banner | None (no trackers in v1) |
| SEO + analytics | Deferred to Phase 9 |
| Cards per row | 2 mobile / 3 tablet / 4 desktop / 5 wide-desktop |
| Mobile design | First-class, treated as separate pass per page (responsive single codebase) |

---

## 5. Site Map

### Public
- `/` — Home
- `/products` — Catalog (search + filters + sort + pagination)
- `/products/[slug]` — Product detail (PDP) — *user shares design idea before build*
- `/categories/[slug]` — Category page (e.g. `/categories/dining`)
- `/categories/[slug]/[subSlug]` — Sub-category page (e.g. `/categories/dining/dining-tables`)
- `/collections/[slug]` — Series spotlight (e.g. `/collections/black-walnut-round-table-series`)
- `/about` — About page (placeholder copy)
- `/contact` — Contact page (WhatsApp button + business info)
- `/privacy` — Privacy policy
- `/terms` — Terms of use

### Admin (protected via middleware)
- `/admin/login`
- `/admin` — Dashboard (counters + 30-day click chart + top-5 + recent products)
- `/admin/products` — Product list table
- `/admin/products/new` — Create product
- `/admin/products/[id]` — Edit product

### API
- `/api/track-click` — POST: log enquiry click (rate-limit + Origin check deferred)

### Catch-alls
- `/404`, `/500`

---

## 6. Page Specs

### 6.1 Home page (top → bottom)

1. **Hero** — split layout, lifestyle Unsplash interior right, copy left
   - Headline: *"Contract furniture, curated globally."*
   - Sub: *"Sourced from leading factories worldwide. Built for India's hospitality, design, and architecture professionals."*
   - CTAs: `[ Browse Catalog ]` (primary, `/products`) + `[ Request Trade Access ]` (WhatsApp deeplink with prefilled trade-access template)

2. **Trust strip** — 4 icon+line items:
   - Sourced from 8+ countries
   - Trusted by hotels, designers & architects
   - Direct WhatsApp inquiry
   - Personalized catalog on request

3. **Shop by Category** — 6 tiles (Dining, Living Room, Bedroom, Office, Outdoor, Storage)
   - 4-col desktop / 2-col mobile
   - Image cropped from real catalog product
   - Label + live product count (e.g. "Dining · 24")
   - Click → `/categories/[slug]`

4. **Featured Products** — 4-col grid, 8 admin-curated SKUs (`is_featured=true`)

5. **Shop by Project Type** — 4 tiles (Hospitality, Residential, Office, Restaurant)
   - Unsplash lifestyle imagery
   - Click → `/products?project=hospitality` etc.

6. **Collection / Series spotlight** — one curated series, 3–4 product preview + "View collection" link to `/collections/[slug]`

7. **About strip** — 2-line brand pitch + "Learn more" → `/about`

8. **Client logos / testimonials** — placeholder (hidden until real content is available)

9. **CTA banner** — full-width, "Working on a project? Request a curated catalog →" → WhatsApp deeplink

10. **Footer**

### 6.2 Catalog listing (`/products`)

- **Top:** breadcrumb · sort dropdown (Featured, Newest, Name A–Z) · result count · search bar (full-text on name+SKU+description)
- **Sidebar (desktop) / bottom-sheet (mobile):** filters
  - Category / Sub-category (collapsible tree)
  - Series / Collection
  - Material
  - Color / Finish
  - Country of origin
  - Lead time bucket (≤4w, 4–8w, 8+w)
  - Capacity / size
  - In-stock only
- **Grid:** 4 columns desktop / 3 tablet / 2 mobile
- **Cards:**
  - Square 1:1 image with country flag badge top-right
  - Image hover: subtle zoom + button darkens
  - Product name (1 line, truncate)
  - SKU + category (smaller, gray)
  - Dimensions
  - Full-width `[ Enquire on WhatsApp ]` button
  - Click image/name → PDP; click button → WhatsApp directly
- **Pagination** (not infinite scroll) — 24 per page
- **Empty/loading/error** states required

### 6.3 Product detail (`/products/[slug]`)

⏸ **Build paused — user shares design idea before I implement this page.**

Required fields to render (from schema, public-only):
- Image gallery (carousel + thumbs)
- Name, SKU, category, sub-category, series
- Dimensions, material, color, capacity
- Country of origin (with flag)
- MOQ
- Lead time (days, formatted)
- Description (AI-generated, admin-editable)
- Spec PDF download (if available)
- Related products (matching chair etc.)
- **Sticky `[ Enquire on WhatsApp ]` CTA** — bottom on mobile, side-by-side with gallery on desktop

Hidden: supplier name, supplier contact, price.

### 6.4 Category page (`/categories/dining`)

- Hero: category name + short description + sub-category chips
- Same listing component as `/products`, pre-filtered by category
- Sub-category routes (`/categories/dining/dining-tables`) work the same way

### 6.5 Series page (`/collections/black-walnut-round-table-series`)

- Hero image + series name + description
- All products in this series in 4-col grid

### 6.6 About / Contact / Privacy / Terms

- Templated copy with brand placeholders
- Contact page = WhatsApp CTA + business email/info

### 6.7 Admin dashboard (`/admin`)

- 3 KPI cards: Total Products · Suppliers · Clicks This Week
- 30-day click chart (line)
- Top-5 most-clicked products (last 30 days)
- Recent 5 products added

### 6.8 Admin product list (`/admin/products`)

Table: thumbnail · name · SKU · category · status (draft/published) · featured · clicks (30d) · updated_at · [edit] [delete]

Filters: status, category, featured, search.

### 6.9 Admin product edit (`/admin/products/[id]` / `/new`)

One big form with collapsible sections:
- **Basic** — name, SKU, slug (auto from name, editable), category, sub-category, series, status, is_featured
- **Specs** — dimensions, material, color, capacity, country_of_origin, MOQ, lead_time_days, project_types[]
- **Media** — drag-drop multi-image upload, drag-to-reorder, spec PDF upload
- **Description** — textarea (AI-generated draft, admin-editable). Source badge: ai/manual.
- **Related products** — multi-select with search
- **Trade (hidden public)** — supplier, price (B2B-hidden but DB-stored)

Save as draft / publish toggle.

---

## 7. Tech Stack (locked, already installed)

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, framer-motion, lucide-react, clsx, tailwind-merge, class-variance-authority
- **Components:** [21st.dev/community/components](https://21st.dev/community/components) as primary source
- **Forms:** react-hook-form + zod
- **State:** zustand (UI), @tanstack/react-query (server)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS) — region `ap-south-1`
- **Image:** `next/image` + sharp (resize on upload)
- **AI (description gen):** Claude Haiku 4.5 via Anthropic SDK
- **Hosting:** Vercel
- **PDF parsing:** pdf-parse v2 (already prototyped)

---

## 8. Folder Structure

```
app/
  (public)/
    page.tsx
    products/
      page.tsx
      [slug]/page.tsx
    categories/
      [slug]/page.tsx
      [slug]/[subSlug]/page.tsx
    collections/
      [slug]/page.tsx
    about/page.tsx
    contact/page.tsx
    privacy/page.tsx
    terms/page.tsx
  admin/
    layout.tsx           # auth guard
    page.tsx
    login/page.tsx
    products/
      page.tsx
      new/page.tsx
      [id]/page.tsx
  api/
    track-click/route.ts
components/
  ui/                    # 21st.dev-derived primitives
  layout/                # navbar, footer, mobile drawer, floating WhatsApp
  product/               # card, gallery, related
  filters/
  admin/
lib/
  supabase/
    client.ts            # browser
    server.ts            # RSC + server actions
    middleware.ts
  whatsapp.ts            # message templates + deeplink builder
  brand.ts               # brand constants (name, tagline, defaults)
  schemas.ts             # zod schemas
  utils.ts
  tracking.ts            # enquiry click POST
scripts/
  import-jinglong.cjs    # PDF importer (already prototyped)
  import-master.cjs      # post-MVP, vision-API based
extracted/
  jinglong/              # output from importer
public/
  ...
```

---

## 9. Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server-only

# WhatsApp
WHATSAPP_BUSINESS_NUMBER=          # e.g. 919876543210 (no +)

# Anthropic (for description generation)
ANTHROPIC_API_KEY=                 # used only by import scripts

# Site
NEXT_PUBLIC_SITE_URL=              # e.g. https://yourdomain.com
```

---

## 10. Database Schema (locked, see Q23)

Already documented in §13 of v1 PRD; final version locked in conversation. Key tables:

- `categories` (self-referencing parent_id for 2-level hierarchy)
- `suppliers` (private, admin-only RLS)
- `series`
- `products` (slug, status draft/published, soft delete, full-text search index, project_types array)
- `product_relations` (matching chairs etc.)
- `enquiry_clicks` (analytics)
- `settings` (key-value JSON for runtime config)

RLS: public read on published products / categories / series; suppliers admin-only; enquiry_clicks insert-only via API.

Storage buckets: `products`, `series-heroes`, `spec-pdfs` (public read); `catalogs` (private).

---

## 11. WhatsApp Deeplink Templates (locked)

Centralized in `lib/whatsapp.ts`.

### Product inquiry
```
Hi, I'd like to enquire about this product:

*{{name}}* (SKU: {{sku}})
Series: {{series}}
Dimensions: {{dimensions}}

Link: {{site_url}}/products/{{slug}}

Please share details and pricing.
```

### Trade access (hero CTA)
```
Hi, I'd like to request trade access.

Company / Studio:
City:
Project type (Hospitality / Residential / Office / Retail):
Approx. monthly volume:
GSTIN (if available):

Looking forward to your catalog and trade pricing.
```

### Catalog request (footer CTA)
```
Hi, I'd like to request a curated catalog for an upcoming project.

Project type:
City:
Approx. quantity / scope:

Please share what you have available.
```

Each click logged to `enquiry_clicks` with `source` ∈ {`pdp`, `card`, `floating`, `hero`, `footer`}.

---

## 12. Build Plan — fast-track to live (~8 working days)

### Phase 0 — Setup (½ day)
- Next.js scaffold inside existing project
- Tailwind config + CSS variables for theming
- Folder structure, TS config, ESLint, Prettier
- `lib/brand.ts` + `.env.example`

### Phase 1 — Backend foundation (1 day)
- Supabase project provisioned (user provides credentials)
- Migration: schema + RLS + storage buckets + 6 categories seed
- Supabase client/server/middleware utilities
- Type generation

### Phase 2 — Public site shell (1 day)
- Layout (navbar, footer, mobile drawer)
- Floating WhatsApp button
- Routing for all public routes (placeholders)
- `lib/whatsapp.ts` + reusable button components
- `/api/track-click` route + integration

### Phase 3 — Catalog browsing (2 days)
- Home page (10 sections)
- `/products` listing with search, category filter, sort, pagination
- Category + sub-category routes
- Series page route
- About / Contact / Privacy / Terms

### ⏸ PAUSE — user shares PDP design idea

### Phase 4 — Product detail page (1 day)
- Build per user's design input
- Sticky WhatsApp CTA, image gallery, related products, all spec fields

### Phase 5 — Admin essentials (1½ days)
- `/admin/login` + middleware auth
- Minimal dashboard (counters + chart + top-5)
- Product list table + edit form (one big form, image upload, drag-reorder)
- Soft delete (no Trash UI for v1)

### Phase 6 — Catalog import (1 day)
- Extend `scripts/import-jinglong.cjs` (text + image extraction already prototyped)
- Add Claude Haiku description-gen pass
- Upload images via sharp resize → Supabase Storage
- Insert 47 products as `status='draft'`
- Manually publish after spot-check via admin

### Phase 7 — Deploy (½ day)
- Vercel deploy
- Connect domain
- Production env vars
- Smoke test
- Soft launch — share URL with you to validate before public push

### Phase 9 (post-launch) — deferred
- SEO (sitemap, robots, OG, JSON-LD) + GA4 + Microsoft Clarity
- Master PDF vision/OCR import → ~150 more products
- Brand polish (colors, typography, custom hero shot, logo)
- Series/Suppliers/Categories CRUD admin UIs
- Trash/restore UI
- Settings page
- About copy from real brand voice
- Bulk CSV product import (when you hit 50+ adds at once)

---

## 13. Definition of Live (Phase 7 done)

- ✅ Domain points to Vercel deploy on HTTPS
- ✅ Home page renders correctly mobile + desktop
- ✅ At least 30 products live (`status='published'`)
- ✅ Each live product has ≥1 image, dimensions, AI description, country of origin
- ✅ All WhatsApp CTAs (PDP, card, floating, hero, footer) open with correct prefilled message
- ✅ Click logging works end-to-end
- ✅ Admin can log in and edit any product
- ✅ No console errors on any public route

---

## 14. Notes & Principles

- **Boring tech.** Next.js + Supabase + Vercel + Resend (later). Proven, cheap, fast.
- **Inquiry conversion is the metric.** Every UX decision serves it.
- **Mobile first.** Most B2B browsing in India is mobile.
- **No premature abstraction.** Build it once, abstract on second use.
- **Admin can fix anything in production without redeploying** (Supabase Studio is the safety net for v1).
- **Brand polish comes after revenue starts flowing.** Don't optimize colors before there are visitors.
