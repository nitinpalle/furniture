import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { cn } from "@/lib/utils";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
          About
        </p>
        <h1 className="font-[var(--font-display)] mt-3 text-balance text-3xl font-medium tracking-tight md:text-5xl">
          Furniture for projects that demand more.
        </h1>
        <div className="text-[var(--color-fg-muted)] mt-8 space-y-6 text-base leading-relaxed">
          <p>
            {brand.name} is a B2B furniture catalog built for designers,
            architects, hotels, restaurants, and contractors furnishing
            projects in India.
          </p>
          <p>
            We curate from leading factories across China, Italy, Vietnam, and
            beyond — vetting each supplier for build quality, lead-time
            consistency, and trade-grade construction. Every SKU on this
            catalog is one we&rsquo;d source for our own project.
          </p>
          <p>
            The site is a working catalog, not a checkout. Browse by category,
            see real-world dimensions, and message us on WhatsApp with the
            SKUs you&rsquo;re interested in. We respond with a curated quote,
            country of origin, MOQ, and lead time within one business day.
          </p>
          <p>
            No forms. No follow-up sequences. No retargeting ads. Just a
            buyer-seller WhatsApp conversation, the way trade has always
            worked.
          </p>
        </div>
      </section>

      <section
        className={cn(
          "border-[var(--color-border)] border-t bg-[var(--color-bg-elevated)]",
          "py-16 md:py-20",
        )}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[var(--font-display)] text-2xl font-medium md:text-3xl">
            Working on a project?
          </h2>
          <p className="text-[var(--color-fg-muted)] mx-auto mt-3 max-w-xl text-sm md:text-base">
            Tell us your scope. We&rsquo;ll share a curated catalog and trade
            pricing for what we have available.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <WhatsAppCTA
              variant="primary"
              template="catalog-request"
              source="footer"
            >
              Request Catalog
            </WhatsAppCTA>
          </div>
        </div>
      </section>
    </>
  );
}
