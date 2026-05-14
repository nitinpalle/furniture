import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { CatalogIndex, type CatalogIndexRow } from "@/components/home/CatalogIndex";
import { MaterialGrid, type Material } from "@/components/home/MaterialGrid";
import { CuratorEdit } from "@/components/home/CuratorEdit";
import { Provenance, type Workshop } from "@/components/home/Provenance";
import { getCategoryTiles, getFeaturedProducts } from "@/lib/products";
import { PROJECT_TYPES } from "@/lib/nav-data";
import { cn } from "@/lib/utils";

// =============================================================
// CONFIG — the only place imagery and curated copy live.
// Replace these with real shoots / real schema data as it arrives.
// =============================================================

const HERO_PORTRAIT =
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

// Macro material library — close-ups read well even at stock quality, which
// is exactly why we lead with substance instead of lifestyle.
const MATERIALS: Material[] = [
  {
    name: "Solid Oak",
    origin: "Slovenia · FSC",
    count: 38,
    query: "oak",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "FSC Walnut",
    origin: "Yogyakarta",
    count: 22,
    query: "walnut",
    image:
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Wool Bouclé",
    origin: "Porto · Undyed",
    count: 17,
    query: "boucle",
    image:
      "https://images.unsplash.com/photo-1493946740644-2d8a1f1a6aff?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Travertine",
    origin: "Italy · Vein-cut",
    count: 9,
    query: "travertine",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Hand-loomed Linen",
    origin: "Florence · Belgian",
    count: 14,
    query: "linen",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Solid Brass",
    origin: "Jaipur · Hand-cast",
    count: 11,
    query: "brass",
    image:
      "https://images.unsplash.com/photo-1601139693242-cfca77df1bf1?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Rattan & Cane",
    origin: "Da Nang",
    count: 13,
    query: "rattan",
    image:
      "https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Vegetable Leather",
    origin: "Florence",
    count: 8,
    query: "leather",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85&auto=format&fit=crop",
  },
];

// Curator's pick captions — short editorial lines that travel with each
// featured product. Falls back to a generic prompt if the catalog hasn't
// added captions for a piece yet.
const EDIT_CAPTIONS: string[] = [
  "Solid white-oak frame, hand-woven Danish cord. Specified for a coastal villa in Alibaug.",
  "Single-slab walnut, finished with linseed and beeswax. In a sixteen-seat suite in Udaipur.",
  "Hand-tufted bouclé, kiln-dried frame, ten-year warranty. Modular up to four-seat.",
  "Belgian linen headboard, solid oak frame, optional storage base.",
];

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
  const [featured, categoryTiles] = await Promise.all([
    getFeaturedProducts(4),
    getCategoryTiles(),
  ]);

  // Build the Index — real DB data, defaulting to standard 6 categories if
  // the catalog hasn't been seeded yet so the homepage still renders.
  const populated = categoryTiles.filter((t) => t.count > 0);
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

  // The Edit — first 4 featured, with editorial numbers + captions
  const editEntries = featured.slice(0, 4).map((p, i) => ({
    ...p,
    number: `№ 0${i + 1}`,
    caption: EDIT_CAPTIONS[i],
  }));

  return (
    <>
      {/* ============================================================
          OPENING LOCKUP — type-led hero, single considered portrait
         ============================================================ */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-6 pt-16 pb-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:px-12 lg:pt-24 lg:pb-32 xl:pt-32">
          {/* Left — type */}
          <div className="iv flex flex-col justify-between gap-12">
            <div>
              <p className="eyebrow eyebrow-rule">
                Volume IV · Spring 2026
              </p>
              <h1
                className={cn(
                  "mt-8 font-[var(--font-display)] font-light leading-[0.96] tracking-[-0.022em]",
                  "text-[clamp(2.75rem,7.2vw,6.75rem)] text-balance",
                )}
              >
                Contract furniture, <em className="font-normal">curated</em>
                <br />
                for India&rsquo;s most
                <br />
                considered interiors.
              </h1>
              <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg">
                A working catalog for designers, architects, and hospitality
                groups — sourced from eight workshops, delivered as one
                consignment, billed in conversation rather than checkout.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
                <Link
                  href="#index"
                  className={cn(
                    "magnetic inline-flex items-center gap-3 rounded-md bg-[var(--color-fg)] px-7 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--color-bg)]",
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

            {/* Footer stats — a print catalog masthead */}
            <dl className="grid grid-cols-2 gap-y-5 border-t border-[var(--color-border)] pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Pieces
                </dt>
                <dd className="mt-1.5 font-[var(--font-display)] text-2xl font-light tabular-nums">
                  {categoryTiles.reduce((sum, t) => sum + t.count, 0) || 240}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Workshops
                </dt>
                <dd className="mt-1.5 font-[var(--font-display)] text-2xl font-light tabular-nums">
                  {PROVENANCE.length}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Source countries
                </dt>
                <dd className="mt-1.5 font-[var(--font-display)] text-2xl font-light tabular-nums">
                  8
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                  Quote SLA
                </dt>
                <dd className="mt-1.5 font-[var(--font-display)] text-2xl font-light">
                  1 day
                </dd>
              </div>
            </dl>
          </div>

          {/* Right — single considered portrait */}
          <div className="iv relative aspect-[4/5] overflow-hidden rounded-sm bg-[var(--color-accent-soft)] lg:aspect-auto lg:min-h-[640px]">
            <Image
              src={HERO_PORTRAIT}
              alt="The Halden Chair — solid oak, hand-woven cord"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">
                  Plate № 04
                </p>
                <p className="mt-1 font-[var(--font-display)] text-base">
                  The Halden Lounge
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">
                Photographed in Jaipur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE INDEX — the centerpiece
         ============================================================ */}
      <section id="index" className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-36">
          <div className="iv mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow eyebrow-rule">The Index</p>
              <h2 className="mt-5 font-[var(--font-display)] text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                Six rooms.{" "}
                <em className="font-normal italic">One catalog.</em>
              </h2>
            </div>
            <p className="max-w-xs text-sm text-[var(--color-fg-muted)] lg:text-right">
              Each room is a working subset of the full catalog — same vetted
              workshops, same one-day quote turnaround, indexed by what
              you&rsquo;re actually furnishing.
            </p>
          </div>

          <CatalogIndex rows={indexRows} />

          <div className="mt-10 flex justify-end iv">
            <Link
              href="/products"
              className="uline inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
            >
              All {categoryTiles.reduce((s, t) => s + t.count, 0) || "—"} pieces →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE MATERIALS — macro library
         ============================================================ */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-36">
          <div className="iv mb-12 flex items-end justify-between gap-6 lg:mb-16">
            <div>
              <p className="eyebrow eyebrow-rule">By material</p>
              <h2 className="mt-5 font-[var(--font-display)] text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                Substance,{" "}
                <em className="font-normal italic">specified.</em>
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] md:inline-block"
            >
              All materials →
            </Link>
          </div>

          <MaterialGrid materials={MATERIALS} />
        </div>
      </section>

      {/* ============================================================
          THE EDIT — curator's pick, 4 featured products
         ============================================================ */}
      {editEntries.length > 0 && (
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-36">
            <div className="iv mb-16 max-w-2xl lg:mb-24">
              <p className="eyebrow eyebrow-rule">The Edit · Spring</p>
              <h2 className="mt-5 font-[var(--font-display)] text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                Four pieces,{" "}
                <em className="font-normal italic">picked by hand.</em>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[var(--color-fg-muted)]">
                The current curator&rsquo;s edit — drawn from the catalog,
                photographed in situ, specified for the rooms they&rsquo;re
                already in.
              </p>
            </div>

            <CuratorEdit entries={editEntries} />
          </div>
        </section>
      )}

      {/* ============================================================
          PROVENANCE — workshop typographic strip
         ============================================================ */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-36">
          <div className="iv mb-14 max-w-2xl lg:mb-20">
            <p className="eyebrow eyebrow-rule">The Provenance</p>
            <h2 className="mt-5 font-[var(--font-display)] text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Made in eight places.{" "}
              <em className="font-normal italic">
                Delivered to one.
              </em>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-fg-muted)]">
              We consolidate from every workshop into a single tracked
              consignment — cleared, ducted, white-glove installed on your
              site.
            </p>
          </div>

          <Provenance workshops={PROVENANCE} />
        </div>
      </section>

      {/* ============================================================
          BY PROJECT TYPE — kept from real data
         ============================================================ */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="iv mb-10 lg:mb-14">
            <p className="eyebrow eyebrow-rule">By project type</p>
            <h2 className="mt-5 font-[var(--font-display)] text-3xl font-light leading-[1.02] tracking-tight md:text-5xl">
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
          PROCESS — 4 steps
         ============================================================ */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="iv mb-12 lg:mb-16">
            <p className="eyebrow eyebrow-rule">From sketch to site</p>
            <h2 className="mt-5 font-[var(--font-display)] text-3xl font-light leading-[1.02] tracking-tight md:text-5xl">
              Four steps. One consignment.
            </h2>
          </div>
          <ol className="iv-stagger grid gap-8 md:grid-cols-4 lg:gap-10">
            {PROCESS_STEPS.map((step) => (
              <li
                key={step.number}
                className="iv border-t border-[var(--color-border-strong)] pt-6"
              >
                <p className="font-[var(--font-display)] text-2xl font-light tabular-nums text-[var(--color-fg-subtle)]">
                  {step.number}
                </p>
                <h3 className="mt-3 font-[var(--font-display)] text-xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================
          ENQUIRE — full-bleed quiet CTA
         ============================================================ */}
      <section className="bg-[var(--color-fg)] text-[var(--color-bg)]">
        <div className="mx-auto max-w-[1100px] px-6 py-28 text-center lg:px-12 lg:py-40">
          <p className="eyebrow iv" style={{ color: "var(--color-accent-soft)" }}>
            Begin a project
          </p>
          <h2 className="iv mt-5 font-[var(--font-display)] text-5xl font-light leading-[1.02] tracking-tight lg:text-7xl xl:text-8xl">
            Tell us what you&rsquo;re
            <br />
            <em className="font-normal italic">building.</em>
          </h2>
          <p className="iv mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--color-bg)]/70 md:text-lg">
            No forms. No follow-ups. A curated catalog over WhatsApp,
            within a business day.
          </p>
          <div className="iv mt-12 inline-flex">
            <WhatsAppCTA
              variant="primary"
              template="catalog-request"
              source="footer"
              className="magnetic !h-auto !rounded-md !px-8 !py-4 !text-[12px] !uppercase !tracking-[0.22em]"
            >
              Request a curated catalog
            </WhatsAppCTA>
          </div>
          <p className="iv mt-12 text-[10px] uppercase tracking-[0.22em] text-[var(--color-bg)]/40">
            {brand.name} · Volume IV · Spring 2026
          </p>
        </div>
      </section>
    </>
  );
}
