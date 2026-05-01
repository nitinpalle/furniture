import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-36">
      <div className="iv">
        <p className="eyebrow mb-4">Contact</p>
        <h1 className="display-1 font-medium">
          Let&rsquo;s talk about your project.
        </h1>
      </div>
      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg iv">
        Working on a hotel, restaurant, residence, or office fit-out? Send us a
        WhatsApp message — we&rsquo;ll respond with a curated catalog and trade
        pricing for your scope.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 iv">
        <WhatsAppCTA
          variant="primary"
          template="catalog-request"
          source="hero"
        >
          Open WhatsApp
        </WhatsAppCTA>
        <p className="mt-2 text-xs text-[var(--color-fg-subtle)]">
          Replies within one business day, IST.
        </p>
      </div>
    </div>
  );
}
