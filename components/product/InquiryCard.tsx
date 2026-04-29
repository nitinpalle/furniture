import { Clock, Globe, Package } from "lucide-react";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { flagFor } from "@/lib/country";

type InquiryCardProps = {
  productId: string;
  product: {
    slug: string;
    name: string;
    sku: string | null;
    dimensions: string | null;
    series?: string | null;
  };
  countryOfOrigin: string | null;
  moq: number | null;
  leadTimeDays: number | null;
};

/**
 * Replaces the "price + add to cart" panel from a typical PDP.
 * No input fields — every CTA on the site goes straight to WhatsApp
 * (locked decision; the product link gets baked into the prefilled message).
 */
export function InquiryCard({
  productId,
  product,
  countryOfOrigin,
  moq,
  leadTimeDays,
}: InquiryCardProps) {
  const flag = flagFor(countryOfOrigin);

  return (
    <div className="border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] rounded-xl border p-5 shadow-sm sm:p-6">
      <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
        Trade pricing on request
      </p>
      <p className="text-[var(--color-fg-muted)] mt-1 text-sm leading-relaxed">
        Send an inquiry and we&rsquo;ll respond with a curated quote, lead time,
        and supplier details for your project.
      </p>

      <div className="mt-5">
        <WhatsAppCTA
          variant="primary"
          template="product"
          source="pdp"
          productId={productId}
          product={product}
          className="w-full sm:h-12 sm:text-base"
        >
          Enquire on WhatsApp
        </WhatsAppCTA>
      </div>

      <dl className="border-[var(--color-border)] mt-5 grid grid-cols-1 divide-y border-t pt-2 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <KeyFact
          icon={<Globe className="h-4 w-4" />}
          label="Origin"
          value={
            countryOfOrigin
              ? `${flag ? flag + " " : ""}${countryOfOrigin}`
              : "—"
          }
        />
        <KeyFact
          icon={<Package className="h-4 w-4" />}
          label="MOQ"
          value={moq != null ? `${moq} units` : "On request"}
        />
        <KeyFact
          icon={<Clock className="h-4 w-4" />}
          label="Lead time"
          value={
            leadTimeDays != null
              ? `${leadTimeDays}–${leadTimeDays + 15} days`
              : "On request"
          }
        />
      </dl>
    </div>
  );
}

function KeyFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 sm:flex-col sm:items-start sm:gap-1 sm:px-3 sm:py-1 sm:first:pl-0 sm:last:pr-0">
      <span className="text-[var(--color-fg-subtle)]">{icon}</span>
      <div>
        <dt className="text-[var(--color-fg-subtle)] text-xs uppercase tracking-wide">
          {label}
        </dt>
        <dd className="text-[var(--color-fg)] mt-0.5 text-sm font-medium">
          {value}
        </dd>
      </div>
    </div>
  );
}
