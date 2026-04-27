# Furniture — B2B Catalog with WhatsApp Inquiry Flow

A B2B furniture catalog website where designers, architects, hotels, and contractors browse SKUs and inquire **directly via WhatsApp** with full product context auto-attached. No checkout, no accounts, no inquiry forms — every CTA is a `wa.me` deeplink with the SKU baked in.

> Full product spec is in [`PRD.md`](./PRD.md).

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + CSS variables for theming |
| Animation | `motion` + `framer-motion` |
| Components | [21st.dev](https://21st.dev/community/components) primitives + bespoke |
| Forms | `react-hook-form` + `zod` |
| State | `zustand` (UI) · `@tanstack/react-query` (server) |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Image opt | `next/image` + `sharp` |
| Hosting | Vercel + Supabase (region: `ap-south-1`) |
| AI (descriptions) | Claude Haiku 4.5 via Anthropic SDK (catalog importer only) |

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Fill in Supabase URL, anon key, service-role key, and your WhatsApp number.

# 3. Apply DB migrations
# See supabase/README.md — paste the SQL files into Supabase Studio,
# or use the Supabase CLI: `supabase db push`

# 4. (Optional) Regenerate DB types from the live schema
export SUPABASE_PROJECT_REF=<your-project-ref>
npm run db:types

# 5. Run dev server
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run the production build locally |
| `npm run typecheck` | `tsc --noEmit` (also runs in pre-push hook) |
| `npm run lint` | ESLint (also runs in pre-push hook) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (no write) |
| `npm run db:types` | Regenerate `lib/database.types.ts` from Supabase |

## Project structure

```
app/                    # Next.js App Router
├── (public)/           # Public site routes (added in Phase 2/3)
├── admin/              # Protected admin panel (added in Phase 5)
├── api/                # API routes (e.g. /api/track-click)
├── globals.css         # Brand tokens via Tailwind v4 @theme
├── layout.tsx          # Root layout (fonts, metadata)
└── page.tsx            # Home (placeholder until Phase 3)

components/
├── ui/                 # Reusable primitives (button, input, card, etc.)
├── layout/             # Navbar, footer, mobile drawer
├── product/            # Product cards, gallery, related products
├── filters/            # Catalog filter sidebar / bottom-sheet
└── admin/              # Admin-specific components

lib/
├── brand.ts            # Single source of truth for brand strings
├── env.ts              # zod-validated env vars
├── utils.ts            # cn() helper
├── database.types.ts   # Supabase-generated DB types
└── supabase/
    ├── client.ts       # Browser client
    ├── server.ts       # Server-component client + service-role client
    └── middleware.ts   # Session refresh + admin route guard

middleware.ts           # Root middleware (delegates to lib/supabase/middleware.ts)

supabase/
├── README.md           # How to apply migrations
└── migrations/         # SQL migrations (apply in numeric order)

scripts/
└── import-jinglong.cjs # Catalog importer (Phase 6)
```

## Git workflow

- **Never commit directly to `main`.** A Husky pre-push hook blocks it.
- Feature branches: `feat/<desc>`, `fix/<desc>`, `docs/<desc>`, `refactor/<desc>`, `chore/<desc>`.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, …).
- All merges to `main` go through a PR — squash-merge only, branches auto-delete.
- Pre-push hook runs `tsc --noEmit` and `eslint .` — both must pass.

See [`.github/pull_request_template.md`](./.github/pull_request_template.md).

## Inquiry flow

Every "Enquire" CTA on the site builds a `wa.me` deeplink with a prefilled message containing the product name, SKU, dimensions, and PDP URL. WhatsApp opens with that message ready to send to the business number set in `NEXT_PUBLIC_WHATSAPP_NUMBER`.

A best-effort `POST /api/track-click` fires alongside (non-blocking) so the admin dashboard can show "what SKUs are converting." No personal data leaves the browser through this path.

## Roadmap

Build phases (see [PRD §12](./PRD.md#12-build-plan--fast-track-to-live-8-working-days)):

- ✅ **Phase 0** — Project setup, Tailwind, ESLint, brand tokens
- 🚧 **Phase 1** — Backend foundation (Supabase schema, RLS, storage, clients, middleware)
- ⬜ **Phase 2** — Public site shell (navbar, footer, routing, WhatsApp utility)
- ⬜ **Phase 3** — Catalog browsing (home, listing, category pages, series pages)
- ⏸ **Pause** — User shares product detail page design idea
- ⬜ **Phase 4** — Product detail page
- ⬜ **Phase 5** — Admin login + product edit
- ⬜ **Phase 6** — 锦龙 catalog import (47 products, AI descriptions)
- ⬜ **Phase 7** — Deploy to Vercel
- ⬜ **Post-MVP** — SEO, analytics, brand polish, Master PDF vision pipeline
