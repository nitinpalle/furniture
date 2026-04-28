import { brand } from "@/lib/brand";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-10">
        <p className="text-[var(--color-fg-subtle)] mb-3 text-xs font-mono uppercase tracking-widest">
          Legal
        </p>
        <h1 className="font-[var(--font-display)] text-3xl font-medium tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-[var(--color-fg-subtle)] mt-2 text-sm">
          Last updated: 2026-04-28 · Placeholder template — review with a lawyer
          before going public.
        </p>
      </header>

      <div className="prose-furniture text-[var(--color-fg-muted)] space-y-6 text-sm leading-relaxed">
        <p>
          {brand.name} (&quot;we&quot;, &quot;us&quot;) operates this website as
          a B2B furniture catalog. This page explains what data we collect when
          you browse the site or send us an inquiry over WhatsApp.
        </p>

        <Section title="What we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Page visits:</strong> when you click an &ldquo;Enquire on
              WhatsApp&rdquo; button, we log the time, the product (if any),
              your IP address, browser user-agent, and the page you came from.
              This is used solely for aggregate analytics — never linked to a
              person.
            </li>
            <li>
              <strong>WhatsApp messages:</strong> when you message our business
              number, the WhatsApp service handles the conversation. We see
              your name, phone, and message in our WhatsApp inbox.
            </li>
            <li>
              We do <em>not</em> use cookies for advertising or third-party
              tracking on this site.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>
            Inquiry data is used to respond to you, share catalogs, and prepare
            quotes. Aggregate click data is used internally to understand which
            products interest buyers.
          </p>
        </Section>

        <Section title="Sharing">
          <p>
            We do not sell your data. We may share inquiry details with our
            suppliers when sourcing a quote on your behalf, and with third-party
            tools we use to operate the site (hosting, database, WhatsApp).
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can request deletion of your inquiry data at any time by
            messaging us on WhatsApp or emailing the address listed below.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about this policy, message us via WhatsApp from the
            <a
              href="/contact"
              className="hover:text-[var(--color-fg)] mx-1 underline underline-offset-2"
            >
              contact page
            </a>
            .
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
