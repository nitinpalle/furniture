import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
      <p className="text-[var(--color-fg-subtle)] mb-3 text-xs font-mono uppercase tracking-widest">
        Contact
      </p>
      <h1 className="font-[var(--font-display)] text-3xl font-medium tracking-tight md:text-5xl">
        Let&rsquo;s talk about your project.
      </h1>
      <p className="text-[var(--color-fg-muted)] mx-auto mt-4 max-w-xl text-balance">
        Working on a hotel, restaurant, residence, or office fit-out? Send us a
        WhatsApp message — we&rsquo;ll respond with a curated catalog and trade
        pricing for your scope.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3">
        <WhatsAppCTA
          variant="primary"
          template="catalog-request"
          source="hero"
        >
          Open WhatsApp
        </WhatsAppCTA>
        <p className="text-[var(--color-fg-subtle)] text-xs">
          Replies within one business day, IST.
        </p>
      </div>
    </div>
  );
}
