import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { ProductGrid } from "@/components/product/ProductGrid";
import { cn } from "@/lib/utils";
import { getCategoryTiles, getFeaturedProducts } from "@/lib/products";
import { PROJECT_TYPES } from "@/lib/nav-data";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop&q=80";

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

export default async function Home() {
  const [featured, categoryTiles] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryTiles(),
  ]);
  const tiles = categoryTiles.filter((t) => t.count > 0).slice(0, 6);

  return (
    <>
      {/* ============== HERO (full-bleed) ============== */}
      <section className="border-[var(--color-border)] border-b">
        <div className="grid md:grid-cols-2 md:items-stretch">
          {/* Content — internal padding, sits in left half on desktop */}
          <div className="flex items-center px-6 py-16 md:py-24 lg:px-12 lg:py-28 xl:px-20 xl:py-32">
            <div className="max-w-xl">
              <p className="text-[var(--color-fg-subtle)] mb-4 text-xs font-mono uppercase tracking-widest">
                Trade catalog
              </p>
              <h1 className="font-[var(--font-display)] text-balance text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
                {brand.hero.headline}
              </h1>
              <p className="text-[var(--color-fg-muted)] mt-6 max-w-xl text-pretty md:text-lg">
                {brand.hero.subhead}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "primary", size: "lg" }),
                  )}
                >
                  Browse Catalog
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <WhatsAppCTA
                  variant="primary"
                  template="trade-access"
                  source="hero"
                >
                  Request Trade Access
                </WhatsAppCTA>
              </div>
            </div>
          </div>

          {/* Image — touches the right edge of the viewport */}
          <div className="bg-[var(--color-accent-soft)] relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[600px]">
            <Image
              src={HERO_IMAGE_URL}
              alt="Premium dining setup curated for B2B furniture buyers"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============== TRUST STRIP ============== */}
      <section className="border-[var(--color-border)] border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-4 py-8 text-sm md:grid-cols-4 lg:px-8">
          {brand.trustSignals.map((signal) => (
            <p
              key={signal}
              className="text-[var(--color-fg-muted)] flex items-center gap-2 text-xs md:text-sm"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                aria-hidden
              />
              {signal}
            </p>
          ))}
        </div>
      </section>

      {/* ============== SHOP BY CATEGORY ============== */}
      {tiles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
                Shop by category
              </p>
              <h2 className="font-[var(--font-display)] mt-2 text-2xl font-medium md:text-3xl">
                Find your fit, room by room.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                key={tile.slug}
                href={`/categories/${tile.slug}`}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-lg",
                  "border-[var(--color-border)] border bg-[var(--color-accent-soft)]",
                )}
              >
                {tile.cover ? (
                  <Image
                    src={tile.cover}
                    alt={tile.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                  <h3 className="font-[var(--font-display)] text-lg font-medium text-white md:text-xl">
                    {tile.name}
                  </h3>
                  <p className="text-white/80 mt-0.5 text-xs">
                    {tile.count} product{tile.count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============== FEATURED PRODUCTS ============== */}
      {featured.length > 0 && (
        <section
          className={cn(
            "border-[var(--color-border)] border-y bg-[var(--color-bg-elevated)]",
            "py-20 lg:py-24",
          )}
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
                  Our pick
                </p>
                <h2 className="font-[var(--font-display)] mt-2 text-2xl font-medium md:text-3xl">
                  Featured this season.
                </h2>
              </div>
              <Link
                href="/products"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hidden items-center gap-1 text-sm transition-colors sm:inline-flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ProductGrid products={featured} source="card" showEmpty={false} />

            <div className="mt-8 sm:hidden">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "md" }),
                  "w-full",
                )}
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============== SHOP BY PROJECT TYPE ============== */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-24">
        <div className="mb-10">
          <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
            Shop by project type
          </p>
          <h2 className="font-[var(--font-display)] mt-2 text-2xl font-medium md:text-3xl">
            What are you furnishing?
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {PROJECT_TYPES.map((pt) => (
            <Link
              key={pt.slug}
              href={`/products?project=${pt.slug}`}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg",
                "border-[var(--color-border)] border",
              )}
            >
              <Image
                src={PROJECT_TILE_IMAGES[pt.slug] ?? ""}
                alt={pt.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="font-[var(--font-display)] text-lg font-medium text-white md:text-xl">
                  {pt.name}
                </h3>
                <p className="text-white/80 mt-0.5 line-clamp-1 text-xs">
                  {pt.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============== ABOUT STRIP ============== */}
      <section
        className={cn(
          "border-[var(--color-border)] border-t bg-[var(--color-bg-elevated)]",
          "py-20",
        )}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
              About
            </p>
            <h2 className="font-[var(--font-display)] mt-2 text-2xl font-medium md:text-3xl">
              Sourcing for India&rsquo;s most ambitious projects.
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed md:text-base">
              {brand.name} is a B2B furniture catalog built for trade buyers —
              designers, architects, hotel groups, and contractors — who need
              consistent supply at project scale. Every product is sourced from
              vetted factories worldwide.
            </p>
            <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed md:text-base">
              Skip the catalog email tag. Browse by category, message us on
              WhatsApp with the SKU you&rsquo;re interested in, and get a
              curated quote within one business day.
            </p>
            <Link
              href="/about"
              className="text-[var(--color-fg)] hover:text-[var(--color-accent)] inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Learn more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============== CTA BANNER ============== */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-24">
        <div
          className={cn(
            "border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] rounded-2xl border-2 p-10 text-center md:p-16",
          )}
        >
          <h2 className="font-[var(--font-display)] text-balance text-2xl font-medium md:text-4xl">
            Working on a project?
          </h2>
          <p className="text-[var(--color-fg-muted)] mx-auto mt-3 max-w-xl text-sm md:text-base">
            Tell us your scope and we&rsquo;ll send a curated catalog with
            trade pricing — no forms, no follow-ups, just a WhatsApp message.
          </p>
          <div className="mt-8 inline-flex">
            <WhatsAppCTA
              variant="primary"
              template="catalog-request"
              source="footer"
            >
              Request a curated catalog
            </WhatsAppCTA>
          </div>
        </div>
      </section>
    </>
  );
}
