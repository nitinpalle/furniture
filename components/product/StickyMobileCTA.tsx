"use client";

import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import type { ProductForEnquiry } from "@/lib/whatsapp";

type StickyMobileCTAProps = {
  productId: string;
  product: ProductForEnquiry;
};

/**
 * Bottom-pinned WhatsApp CTA visible only on mobile PDP.
 * Sits above the iOS safe-area inset.
 */
export function StickyMobileCTA({ productId, product }: StickyMobileCTAProps) {
  return (
    <div
      className="border-[var(--color-border)] bg-[var(--color-bg)]/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="px-4 py-3">
        <WhatsAppCTA
          variant="sticky"
          template="product"
          source="pdp"
          productId={productId}
          product={product}
        >
          Enquire on WhatsApp
        </WhatsAppCTA>
      </div>
    </div>
  );
}
