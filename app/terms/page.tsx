import { brand } from "@/lib/brand";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-10">
        <p className="text-[var(--color-fg-subtle)] mb-3 text-xs font-mono uppercase tracking-widest">
          Legal
        </p>
        <h1 className="font-[var(--font-display)] text-3xl font-medium tracking-tight md:text-4xl">
          Terms of Use
        </h1>
        <p className="text-[var(--color-fg-subtle)] mt-2 text-sm">
          Last updated: 2026-04-28 · Placeholder template — review with a lawyer
          before going public.
        </p>
      </header>

      <div className="text-[var(--color-fg-muted)] space-y-6 text-sm leading-relaxed">
        <p>
          By accessing this website, you agree to the following terms.
        </p>

        <Section title="Catalog use">
          <p>
            All product information, photography, and copy on this site is the
            property of {brand.name} or its suppliers. The catalog is intended
            for trade reference. Republishing, scraping, or commercial reuse
            without written permission is not permitted.
          </p>
        </Section>

        <Section title="Inquiries and quotes">
          <p>
            Pricing, availability, lead times, and specifications shown or
            communicated in response to an inquiry are indicative only. Final
            terms are confirmed in writing on a per-order basis. We reserve the
            right to decline an order at our discretion.
          </p>
        </Section>

        <Section title="No online sales">
          <p>
            This website is a catalog only. We do not process payments online.
            All transactions are completed offline through written quotes,
            invoices, and contracts.
          </p>
        </Section>

        <Section title="Liability">
          <p>
            The site is provided &ldquo;as is&rdquo;. We do not warrant that
            the catalog is complete, current, or free of errors, and we are
            not liable for any loss arising from the use of this site.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of India. Disputes are
            subject to the exclusive jurisdiction of the courts in our
            registered city.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms from time to time. The current version
            is always available on this page.
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[var(--color-fg)] mb-2 text-base font-semibold">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
