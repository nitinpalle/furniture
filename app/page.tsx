import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CatalogIndex, type CatalogIndexRow } from "@/components/home/CatalogIndex";
import { CuratorEdit } from "@/components/home/CuratorEdit";
import { Provenance, type Workshop } from "@/components/home/Provenance";
import { getCategoryTiles, getFeaturedProducts } from "@/lib/products";
import { PROJECT_TYPES } from "@/lib/nav-data";
import { cn } from "@/lib/utils";

// =============================================================
// CONFIG — the only place static copy and stock imagery live.
// Replace with real shoots / schema-driven data as it arrives.
// =============================================================

// Single considered product portrait for the hero. Use the cover of the
// first featured product if one exists; otherwise fall back to a curated
// still life so the page always has a hero image.
const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1400&q=85&auto=format&fit=crop";

const CATEGORY_DESCRIPTORS: Record<string, string> = {
  living: "Sofas · Lounge chairs · Coffee tables",
  "living-room": "Sofas · Lounge chairs · Coffee tables",
  dining: "Tables · Chairs · Sideboards",
  bedroom: "Beds · Nightstands · Wardrobes",
  office: "Desks · Task chairs · Lounge",
  outdoor: "Lounges · Dining · Sun loungers",
  storage: "Cabinets · Consoles · Shelving",
};

const PROVENANCE: Workshop[] = [
  { city: "Jaipur", country: "India", craft: "Solid wood · Brass" },
  { city: "Da Nang", country: "Vietnam", craft: "Rattan · Cane" },
  { city: "Porto", country: "Portugal", craft: "Bouclé · Linen" },
  { city: "Yogyakarta", country: "Indonesia", craft: "Teak · Mahogany" },
  { city: "Florence", country: "Italy", craft: "Leather · Stone" },
  { city: "Ljubljana", country: "Slovenia", craft: "Oak · Beech" },
  { city: "Marrakech", country: "Morocco", craft: "Hand-loom · Wool" },
  { city: "Mumbai", country: "India", craft: "Curation · QC · Logistics" },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Tell us your scope",
    body: "Project type, room counts, deadlines. We listen first.",
  },
  {
    number: "02",
    title: "Receive a curated edit",
    body: "A bespoke catalog within one business day.",
  },
  {
    number: "03",
    title: "Specify and approve",
    body: "Materials, finishes, dimensions — confirmed in writing.",
  },
  {
    number: "04",
    title: "One tracked consignment",
    body: "Cleared, delivered, white-glove installed on site.",
  },
];

const PROJECT_TILE_IMAGES: Record<string, string> = {
  hospitality:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80&auto=format&fit=crop",
  residential:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop",
};

export default async function Home() {
  // Pull more featured pieces so we can split into The Edit (first 4)
  // and More from the catalog (the rest).
  const [featured, categoryTiles] = await Promise.all([
    getFeaturedProducts(12),
    getCategoryTiles(),
  ]);

  const populated = categoryTiles.filter((t) => t.count > 0);
  const totalPieces = categoryTiles.reduce((s, t) => s + t.count, 0);

  // The Index — real DB data, gracefully falling back to a default 6-row
  // skeleton so the page still renders before the catalog is seeded.
  const indexSource = populated.length
    ? populated.slice(0, 6)
    : [
        { name: "Living Room", slug: "living", count: 0, cover: null },
        { name: "Dining", slug: "dining", count: 0, cover: null },
        { name: "Bedroom", slug: "bedroom", count: 0, cover: null },
        { name: "Office", slug: "office", count: 0, cover: null },
        { name: "Outdoor", slug: "outdoor", count: 0, cover: null },
        { name: "Storage", slug: "storage", count: 0, cover: null },
      ];

  const indexRows: CatalogIndexRow[] = indexSource.map((t, i) => ({
    number: `№ ${String(i + 1).padStart(2, "0")}`,
    name: t.name,
    slug: t.slug,
    descriptor: CATEGORY_DESCRIPTORS[t.slug] ?? "Contract-grade pieces",
    count: t.count,
    cover: t.cover,
  }));

  // The Edit — first 4 featured, with editorial numbering only.
  const editEntries = featured.slice(0, 4).map((p, i) => ({
    ...p,
    number: `№ 0${i + 1}`,
  }));

  // More from the catalog — featured 5..12 in the standard ProductGrid.
  const moreFromCatalog = featured.slice(4, 12);

  // Hero portrait — use the first featured product's cover if present,
  // otherwise the curated fallback. No fake plate number / location caption.
  const heroProduct = featured[0];
  const heroImage = heroProduct?.image_urls?.[0] ?? HERO_FALLBACK;
  const heroAlt = heroProduct?.name ?? "Curated piece from the catalog";

  return (
    <>
      {/* ============================================================
          OPENING LOCKUP — tighter desktop scale, no fake captions
         ============================================================ */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-6 pt-14 pb-16 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:px-12 lg:pt-20 lg:pb-24">
          {/* Left — type */}
          <div className="iv flex flex-col justify-between gap-10">
            <div>
              <p className="eyebrow eyebrow-rule">
                Volume IV · Spring 2026
              </p>
              <h1
                className={cn(
                  "mt-6 font-[var(--font-display)] font-light leading-[1.0] tracking-[-0.02em] text-balance",
                  "text-[clamp(2.25rem,4.8vw,4.25rem)]",
                )}
              >
                Contract furniture,{" "}
                <em className="font-normal italic">curated</em> for
                India&rsquo;s most considered interiors.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-fg-muted)] lg:text-[17px]">
                A working catalog for designers, architects, and hospitality
                groups — sourced from eight workshops, delivered as one
                consignment, priced in conversation.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="#index"
                  className={cn(
                    "magnetic inline-flex items-center gap-3 rounded-md bg-[var(--color-fg)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-bg)]",
                    "transition-[transform,background-color,box-shadow] duration-[var(--duration-fast)] hover:bg-[var(--color-fg-muted)] hover:shadow-[var(--shadow-md)]",
                  )}
                >
                  Browse the catalog
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <WhatsAppCTA
                  variant="compact"
                  template="trade-access"
                  source="hero"
                  className="!bg-transparent !text-[var(--color-fg)] hover:!text-[var(--color-accent)] !uppercase !tracking-[0.22em] !text-[11px] !px-0 !h-auto"
                >
                  Trade access →
                </WhatsAppCTA>
              </div>
            </div>

            {/* Footer stats — the print catalog masthead */}
            <dl className="grid grid-cols-2 gap-y-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Pieces
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-xl font-light tabular-nums">
                  {totalPieces || 240}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Workshops
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-xl font-light tabular-nums">
                  {PROVENANCE.length}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Source countries
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-xl font-light tabular-nums">
                  8
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Quote SLA
                </dt>
                <dd className="mt-1 font-[var(--font-display)] text-xl font-light">
                  1 day
                </dd>
              </div>
            </dl>
          </div>

          {/* Right — single considered portrait (no fake metadata caption) */}
          <div className="iv relative aspect-[4/5] overflow-hidden rounded-sm bg-[var(--color-accent-soft)] lg:aspect-auto lg:min-h-[480px]">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          THE INDEX — the centerpiece
         ============================================================ */}
      <section id="index" className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="iv mb-10 grid items-end gap-6 lg:mb-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow eyebrow-rule">The Index</p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
                Browse the catalog,{" "}
                <em className="font-normal italic">room by room.</em>
              </h2>
            </div>
            <p className="max-w-xs text-sm text-[var(--color-fg-muted)] lg:text-right">
              Every room indexes the same vetted workshops and the same
              one-day quote turnaround.
            </p>
          </div>

          <CatalogIndex rows={indexRows} />

          <div className="iv mt-8 flex justify-end">
            <Link
              href="/products"
              className="uline inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
            >
              All {totalPieces || "—"} pieces →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE EDIT — 4 featured products, editorial spread
         ============================================================ */}
      {editEntries.length > 0 && (
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-12 lg:py-24">
            <div className="iv mb-12 max-w-xl lg:mb-16">
              <p className="eyebrow eyebrow-rule">Featured this season</p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
                Four pieces,{" "}
                <em className="font-normal italic">picked by hand.</em>
              </h2>
            </div>

            <CuratorEdit entries={editEntries} />
          </div>
        </section>
      )}

      {/* ============================================================
          MORE FROM THE CATALOG — denser product grid (real DB data)
         ============================================================ */}
      {moreFromCatalog.length > 0 && (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-12 lg:py-24">
            <div className="iv mb-10 flex items-end justify-between gap-6 lg:mb-12">
              <div>
                <p className="eyebrow eyebrow-rule">More from the catalog</p>
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
                  Recently added.
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] md:inline-block"
              >
                View all →
              </Link>
            </div>

            <ProductGrid
              products={moreFromCatalog}
              source="card"
              showEmpty={false}
            />
          </div>
        </section>
      )}

      {/* ============================================================
          BY PROJECT TYPE — real data
         ============================================================ */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="iv mb-10">
            <p className="eyebrow eyebrow-rule">By project type</p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
              What are you furnishing?
            </h2>
          </div>
          <ul className="iv-stagger grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {PROJECT_TYPES.map((pt) => (
              <li key={pt.slug} className="iv">
                <Link
                  href={`/products?project=${pt.slug}`}
                  className="group/proj relative block aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
                >
                  <Image
                    src={PROJECT_TILE_IMAGES[pt.slug] ?? ""}
                    alt={pt.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/proj:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <h3 className="font-[var(--font-display)] text-lg text-white md:text-xl">
                      {pt.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/80">
                      {pt.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================
          PROVENANCE + PROCESS — combined trust band
         ============================================================ */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="iv mb-10 max-w-2xl lg:mb-12">
            <p className="eyebrow eyebrow-rule">The Provenance</p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
              Made in eight places.{" "}
              <em className="font-normal italic">Delivered to one.</em>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)]">
              We consolidate from every workshop into a single tracked
              consignment — cleared, ducted, white-glove installed on your
              site.
            </p>
          </div>

          <Provenance workshops={PROVENANCE} />

          <div className="mt-16 lg:mt-20">
            <div className="iv mb-8 lg:mb-10">
              <p className="eyebrow">How it works</p>
            </div>
            <ol className="iv-stagger grid gap-7 md:grid-cols-4 lg:gap-10">
              {PROCESS_STEPS.map((step) => (
                <li
                  key={step.number}
                  className="iv border-t border-[var(--color-border-strong)] pt-5"
                >
                  <p className="font-[var(--font-display)] text-lg font-light tabular-nums text-[var(--color-fg-subtle)]">
                    {step.number}
                  </p>
                  <h3 className="mt-2 font-[var(--font-display)] text-lg lg:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================================================
          ENQUIRE — quiet, sized down from the previous monolith
         ============================================================ */}
      <section className="bg-[var(--color-fg)] text-[var(--color-bg)]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 text-center lg:px-12 lg:py-28">
          <p
            className="eyebrow iv"
            style={{ color: "var(--color-accent-soft)" }}
          >
            Begin a project
          </p>
          <h2 className="iv mt-4 font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl">
            Send us your scope.{" "}
            <em className="font-normal italic">We&rsquo;ll send the edit.</em>
          </h2>
          <p className="iv mx-auto mt-6 max-w-lg text-base leading-relaxed text-[var(--color-bg)]/70">
            No forms. No follow-ups. A curated catalog over WhatsApp, within a
            business day.
          </p>
          <div className="iv mt-9 inline-flex">
            <WhatsAppCTA
              variant="primary"
              template="catalog-request"
              source="footer"
              className="magnetic !h-auto !rounded-md !px-7 !py-3.5 !text-[11px] !uppercase !tracking-[0.22em]"
            >
              Request a curated catalog
            </WhatsAppCTA>
          </div>
          <p className="iv mt-10 text-[10px] uppercase tracking-[0.22em] text-[var(--color-bg)]/40">
            {brand.name} · Volume IV · Spring 2026
          </p>
        </div>
      </section>
    </>
  );
}
