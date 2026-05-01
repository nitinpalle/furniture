import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HeroScenes, type HeroScene } from "@/components/home/HeroScenes";
import { Showroom, type ShowroomRoom } from "@/components/home/Showroom";
import { getCategoryTiles, getFeaturedProducts } from "@/lib/products";
import { PROJECT_TYPES } from "@/lib/nav-data";
import { cn } from "@/lib/utils";

// Mock imagery — Unsplash placeholders that match the editorial aesthetic.
// Swap for real product/lifestyle photography once available.
const HERO_SCENES: HeroScene[] = [
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=2200&q=85&auto=format&fit=crop",
    alt: "Curated living room setting in soft natural light",
    label: "01 / Living",
  },
  {
    src: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=2200&q=85&auto=format&fit=crop",
    alt: "Dining setting with single-slab walnut table",
    label: "02 / Dining",
  },
  {
    src: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=2200&q=85&auto=format&fit=crop",
    alt: "Bedroom with linen-upholstered bed",
    label: "03 / Bedroom",
  },
  {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2200&q=85&auto=format&fit=crop",
    alt: "Office workspace with curated furniture",
    label: "04 / Office",
  },
];

const SHOWROOM_FALLBACK_IMAGES: Record<string, string> = {
  living:
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=2000&q=85&auto=format&fit=crop",
  "living-room":
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=2000&q=85&auto=format&fit=crop",
  dining:
    "https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=2000&q=85&auto=format&fit=crop",
  bedroom:
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=2000&q=85&auto=format&fit=crop",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=85&auto=format&fit=crop",
  outdoor:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2000&q=85&auto=format&fit=crop",
  storage:
    "https://images.unsplash.com/photo-1616627988464-8b58e8e9adcf?w=2000&q=85&auto=format&fit=crop",
};

const SHOWROOM_HOTSPOTS: Record<
  string,
  { top: string; left: string; eyebrow: string; name: string; detail?: string }[]
> = {
  living: [
    {
      top: "55%",
      left: "32%",
      eyebrow: "Vela Sofa",
      name: "Boucle, oak frame",
      detail: "3-seat · Made in Porto",
    },
    {
      top: "62%",
      left: "62%",
      eyebrow: "Ostra Coffee Table",
      name: "Solid walnut",
      detail: "Made in Yogyakarta",
    },
  ],
  dining: [
    {
      top: "50%",
      left: "48%",
      eyebrow: "Halden Refectory",
      name: "Single-slab walnut, 3.6m",
    },
  ],
  bedroom: [
    {
      top: "58%",
      left: "42%",
      eyebrow: "Solea Bed",
      name: "Linen-upholstered, oak",
    },
  ],
  office: [],
};

const PROJECT_TILE_IMAGES: Record<string, string> = {
  hospitality:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80",
  residential:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
};

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

function pickShowroomImage(slug: string, cover: string | null): string {
  if (cover) return cover;
  return (
    SHOWROOM_FALLBACK_IMAGES[slug] ?? SHOWROOM_FALLBACK_IMAGES.living
  );
}

export default async function Home() {
  const [featured, categoryTiles] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryTiles(),
  ]);

  const populatedTiles = categoryTiles.filter((t) => t.count > 0);
  const tiles = populatedTiles.slice(0, 6);

  const showroomSource = populatedTiles.length
    ? populatedTiles.slice(0, 4)
    : [
        { name: "Living Room", slug: "living", count: 0, cover: null },
        { name: "Dining", slug: "dining", count: 0, cover: null },
        { name: "Bedroom", slug: "bedroom", count: 0, cover: null },
        { name: "Office", slug: "office", count: 0, cover: null },
      ];

  const rooms: ShowroomRoom[] = showroomSource.map((tile, i) => ({
    number: `№ 0${i + 1}`,
    label: tile.name,
    title: `The ${tile.name}.`,
    href: `/categories/${tile.slug}`,
    image: pickShowroomImage(tile.slug, tile.cover),
    hotspots: SHOWROOM_HOTSPOTS[tile.slug] ?? [],
  }));

  return (
    <>
      {/* ============== HERO (cross-fade scenes — always dark over imagery) ============== */}
      <section className="relative h-screen w-full overflow-hidden">
        <HeroScenes scenes={HERO_SCENES} />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

        <div className="relative z-10 h-full max-w-[1500px] mx-auto px-6 lg:px-12 flex flex-col justify-end pb-32 lg:pb-40">
          <div className="flex items-end justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent-soft)] mb-6">
                An invitation to wander
              </p>
              <h1 className="font-[var(--font-display)] font-light text-[clamp(2.4rem,7vw,7rem)] leading-[0.95] tracking-[-0.02em] text-white">
                Step into the
                <br />
                <em className="font-normal">showroom.</em>
              </h1>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="#showroom"
                  className="magnetic inline-flex items-center gap-3 bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] font-medium rounded-md hover:bg-[var(--color-accent)]/90 transition"
                >
                  Begin the tour
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <WhatsAppCTA
                  variant="compact"
                  template="trade-access"
                  source="hero"
                  className="!bg-transparent !text-white hover:!text-[var(--color-accent-soft)] !uppercase !tracking-[0.24em] !text-[11px] !px-0 !h-auto"
                >
                  Trade access →
                </WhatsAppCTA>
              </div>
            </div>
            <div className="hidden lg:block text-right text-[10px] uppercase tracking-[0.3em] text-white/60 max-w-[200px]">
              {tiles
                .slice(0, 5)
                .map((t) => t.name)
                .join(" · ") || "Living · Dining · Bedroom · Office · Outdoor"}
              {" "}— four scenes, six rooms, one catalog.
            </div>
          </div>
        </div>
      </section>

      {/* ============== INTRO ============== */}
      <section className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] py-28 lg:py-36">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 items-end">
          <p className="lg:col-span-3 text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] iv">
            A studio without walls.
          </p>
          <h2 className="lg:col-span-9 font-[var(--font-display)] font-light text-3xl lg:text-5xl leading-[1.15] iv text-[var(--color-fg)]">
            {brand.name} is a contract furniture house for projects that read
            like rooms — not warehouses. Eight countries of provenance, one
            curator, every piece specified for the way you&rsquo;ll actually
            live in it.
          </h2>
        </div>
      </section>

      {/* ============== HORIZONTAL SHOWROOM ============== */}
      <section
        id="showroom"
        className="bg-[var(--color-bg)] py-24 lg:py-32 overflow-hidden border-b border-[var(--color-border)]"
      >
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-16 flex items-end justify-between iv">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
              The Showroom
            </p>
            <h2 className="font-[var(--font-display)] font-light text-4xl lg:text-6xl tracking-tight">
              Walk through {rooms.length} rooms.
            </h2>
          </div>
          <p className="hidden md:block text-[11px] uppercase tracking-[0.24em] text-[var(--color-fg-muted)]">
            Drag · Scroll · Tap a piece
          </p>
        </div>

        <Showroom rooms={rooms} />
      </section>

      {/* ============== CATEGORIES ============== */}
      {tiles.length > 0 && (
        <section
          id="categories"
          className="bg-[var(--color-bg-elevated)] py-24 lg:py-32 border-b border-[var(--color-border)]"
        >
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-12 iv">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
                  The Catalog
                </p>
                <h2 className="font-[var(--font-display)] font-light text-4xl lg:text-6xl">
                  Find your fit, room by room.
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden md:inline-block text-[11px] uppercase tracking-[0.24em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition"
              >
                All categories →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {tiles.map((tile, i) => (
                <Link
                  key={tile.slug}
                  href={`/categories/${tile.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-accent-soft)]"
                >
                  {tile.cover ? (
                    <Image
                      src={tile.cover}
                      alt={tile.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">
                      № 0{i + 1}
                    </p>
                    <h3 className="font-[var(--font-display)] text-2xl lg:text-3xl text-white mt-1">
                      {tile.name}
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1">
                      {tile.count} piece{tile.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============== FEATURED PRODUCTS ============== */}
      {featured.length > 0 && (
        <section className="bg-[var(--color-bg)] py-24 lg:py-32 border-b border-[var(--color-border)]">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-12 iv">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
                  Currently in the room
                </p>
                <h2 className="font-[var(--font-display)] font-light text-4xl lg:text-6xl">
                  Featured this season.
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden md:inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.24em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>

            <ProductGrid products={featured} source="card" showEmpty={false} />

            <div className="mt-10 sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center justify-center w-full gap-3 border border-[var(--color-border-strong)] text-[var(--color-fg)] px-6 py-4 text-[11px] uppercase tracking-[0.24em] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition rounded-md"
              >
                View all products
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============== SHOP BY PROJECT TYPE ============== */}
      <section className="bg-[var(--color-bg-elevated)] py-24 lg:py-32 border-b border-[var(--color-border)]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="mb-12 iv">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
              Shop by project type
            </p>
            <h2 className="font-[var(--font-display)] font-light text-4xl lg:text-6xl">
              What are you furnishing?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {PROJECT_TYPES.map((pt) => (
              <Link
                key={pt.slug}
                href={`/products?project=${pt.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
              >
                <Image
                  src={PROJECT_TILE_IMAGES[pt.slug] ?? ""}
                  alt={pt.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <h3 className="font-[var(--font-display)] text-lg md:text-xl text-white">
                    {pt.name}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-0.5 line-clamp-1">
                    {pt.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== PROCESS ============== */}
      <section
        id="process"
        className="bg-[var(--color-bg)] py-24 lg:py-32 border-b border-[var(--color-border)]"
      >
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <div className="iv mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
              From sketch to site
            </p>
            <h2 className="font-[var(--font-display)] font-light text-4xl lg:text-5xl">
              Four steps. One consignment.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 lg:gap-10">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="iv border-t border-[var(--color-border-strong)] pt-6"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">
                  {step.number}
                </p>
                <h3 className="font-[var(--font-display)] text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== ENQUIRE ============== */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=2000&q=80&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent-soft)] mb-5 iv">
            Begin a project
          </p>
          <h2
            className={cn(
              "font-[var(--font-display)] font-light text-5xl lg:text-7xl leading-[1.02] iv text-white",
            )}
          >
            Tell us what you&rsquo;re
            <br />
            <em className="font-normal">building.</em>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-white/80 iv">
            No forms. No follow-ups. Just a curated catalog over WhatsApp,
            within a business day.
          </p>
          <div className="mt-12 inline-flex iv">
            <WhatsAppCTA
              variant="primary"
              template="catalog-request"
              source="footer"
              className="magnetic"
            >
              Request a curated catalog
            </WhatsAppCTA>
          </div>
        </div>
      </section>
    </>
  );
}
