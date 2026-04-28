"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppDeeplink,
  type EnquiryClickSource,
  type ProductForEnquiry,
  type WhatsAppDeeplinkInput,
} from "@/lib/whatsapp";
import { trackEnquiryClick } from "@/lib/tracking";

// =============================================================
// VARIANTS
// =============================================================

const ctaVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-whatsapp)] whitespace-nowrap",
  {
    variants: {
      variant: {
        // Primary CTA: solid pill button (PDP, hero, footer)
        primary:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] shadow-sm hover:shadow-md rounded-md h-11 px-5 text-sm",
        // Compact button (navbar, product cards)
        compact:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] rounded-md h-9 px-4 text-xs uppercase tracking-wide",
        // Sticky footer-bar on mobile PDP
        sticky:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] rounded-md w-full h-12 text-sm",
        // Floating bottom-right circular button (sitewide on mobile/desktop)
        floating:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] rounded-full w-14 h-14 shadow-xl hover:shadow-2xl",
        // Icon-only (product card overlay)
        icon:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] rounded-full w-10 h-10",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

// =============================================================
// COMPONENT
// =============================================================

type WhatsAppCTAProps = VariantProps<typeof ctaVariants> & {
  source: EnquiryClickSource;
  productId?: string | null;
  className?: string;
  children?: React.ReactNode;
} & (
  | { template: "product"; product: ProductForEnquiry }
  | { template: "trade-access" }
  | { template: "catalog-request" }
);

export function WhatsAppCTA({
  variant,
  source,
  productId,
  className,
  children,
  ...rest
}: WhatsAppCTAProps) {
  const deeplinkInput = rest as WhatsAppDeeplinkInput;
  const href = buildWhatsAppDeeplink(deeplinkInput);

  const handleClick = React.useCallback(() => {
    trackEnquiryClick({
      productId: productId ?? null,
      source,
    });
  }, [productId, source]);

  // Default labels per variant when no children passed
  const defaultLabel = (() => {
    switch (variant) {
      case "compact":
        return "Enquire";
      case "primary":
        return rest.template === "trade-access"
          ? "Request Trade Access"
          : rest.template === "catalog-request"
            ? "Request Catalog"
            : "Enquire on WhatsApp";
      case "sticky":
        return "Enquire on WhatsApp";
      case "floating":
      case "icon":
      default:
        return null;
    }
  })();

  const showIcon = variant !== "primary" || rest.template === "product";
  const isIconOnly = variant === "floating" || variant === "icon";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={
        isIconOnly
          ? rest.template === "product"
            ? `Enquire about ${rest.product.name} on WhatsApp`
            : "Enquire on WhatsApp"
          : undefined
      }
      className={cn(ctaVariants({ variant }), className)}
    >
      {showIcon && (
        <MessageCircle
          className={cn(
            "shrink-0",
            variant === "floating" ? "w-7 h-7" : "w-4 h-4",
          )}
          aria-hidden
        />
      )}
      {!isIconOnly && (children ?? defaultLabel)}
    </Link>
  );
}
