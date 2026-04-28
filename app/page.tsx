import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      {/* Hero — shell only; full hero (Unsplash image, layout) lands in Phase 3 */}
      <section className="border-[var(--color-border)] border-b">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28 lg:px-8 lg:py-32">
          <div>
            <p className="text-[var(--color-fg-subtle)] mb-4 text-xs font-mono uppercase tracking-widest">
              Phase 2 · Site shell live
            </p>
            <h1 className="font-[var(--font-display)] text-balance text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              {brand.hero.headline}
            </h1>
            <p className="text-[var(--color-fg-muted)] mt-6 max-w-xl text-pretty md:text-lg">
              {brand.hero.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
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

          <div
            className={`border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] flex aspect-[4/3] items-center justify-center rounded-lg border md:aspect-auto md:h-[480px]`}
            aria-label="Hero image placeholder"
          >
            <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
              Unsplash hero · Phase 3
            </p>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-[var(--color-border)] border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-4 py-8 text-sm md:grid-cols-4 lg:px-8">
          {brand.trustSignals.map((signal) => (
            <p
              key={signal}
              className="text-[var(--color-fg-muted)] flex items-center gap-2 text-center text-xs md:text-sm"
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

      {/* Phase preview placeholder */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-[var(--color-fg-subtle)] mb-2 text-xs font-mono uppercase tracking-widest">
            Phase 3 lands next
          </p>
          <h2 className="font-[var(--font-display)] text-2xl font-medium md:text-3xl">
            Categories, featured products, project-type tiles, collections
          </h2>
          <p className="text-[var(--color-fg-muted)] mx-auto mt-3 max-w-xl text-sm">
            Phase 2 ships the shell — navbar, footer, mobile drawer, sitewide
            WhatsApp CTAs, click tracking. Phase 3 fills in the home page and
            catalog.
          </p>
        </div>
      </section>
    </>
  );
}
