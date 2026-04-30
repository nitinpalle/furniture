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
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <div className="iv">
          <p className="eyebrow eyebrow-rule">About</p>
          <h1 className="display-1 mt-5 font-medium">
            Furniture for projects that demand more.
          </h1>
        </div>
        <div className="iv-stagger mt-10 space-y-6 text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg">
          <p className="iv">
            <span className="font-medium text-[var(--color-fg)]">
              {brand.name}
            </span>{" "}
            is a B2B furniture catalog built for designers, architects, hotels,
            restaurants, and contractors furnishing projects in India.
          </p>
          <p className="iv">
            We curate from leading factories across China, Italy, Vietnam, and
            beyond — vetting each supplier for build quality, lead-time
            consistency, and trade-grade construction. Every SKU on this catalog
            is one we&rsquo;d source for our own project.
          </p>
          <p className="iv">
            The site is a working catalog, not a checkout. Browse by category,
            see real-world dimensions, and message us on WhatsApp with the SKUs
            you&rsquo;re interested in. We respond with a curated quote, country
            of origin, MOQ, and lead time within one business day.
          </p>
          <p className="iv">
            No forms. No follow-up sequences. No retargeting ads. Just a
            buyer-seller WhatsApp conversation, the way trade has always worked.
          </p>
        </div>
      </section>

      <section className="hairline-t bg-[var(--color-bg-elevated)] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="eyebrow iv">Working on a project?</p>
          <h2 className="display-2 mt-4 font-medium iv">
            Tell us your scope.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-fg-muted)] iv">
            We&rsquo;ll share a curated catalog and trade pricing for what we
            have available — over WhatsApp, within one business day.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 iv">
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
