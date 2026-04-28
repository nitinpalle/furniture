/**
 * WhatsApp deeplink builder + message templates.
 *
 * Single source of truth for every "Enquire on WhatsApp" CTA on the site.
 * Edit copy here once; all CTAs update.
 */

import { brand } from "@/lib/brand";

export type EnquiryClickSource = "pdp" | "card" | "floating" | "hero" | "footer";

export type EnquiryTemplate = "product" | "trade-access" | "catalog-request";

export type ProductForEnquiry = {
  slug: string;
  name: string;
  sku?: string | null;
  dimensions?: string | null;
  series?: string | null;
};

// =============================================================
// MESSAGE TEMPLATES
// =============================================================

function productMessage(product: ProductForEnquiry, siteUrl: string) {
  const lines = [
    "Hi, I'd like to enquire about this product:",
    "",
    `*${product.name}*${product.sku ? ` (SKU: ${product.sku})` : ""}`,
  ];
  if (product.series) lines.push(`Series: ${product.series}`);
  if (product.dimensions) lines.push(`Dimensions: ${product.dimensions}`);
  lines.push("");
  lines.push(`Link: ${siteUrl}/products/${product.slug}`);
  lines.push("");
  lines.push("Please share details and pricing.");
  return lines.join("\n");
}

function tradeAccessMessage() {
  return [
    "Hi, I'd like to request trade access.",
    "",
    "Company / Studio:",
    "City:",
    "Project type (Hospitality / Residential / Office / Retail):",
    "Approx. monthly volume:",
    "GSTIN (if available):",
    "",
    "Looking forward to your catalog and trade pricing.",
  ].join("\n");
}

function catalogRequestMessage() {
  return [
    "Hi, I'd like to request a curated catalog for an upcoming project.",
    "",
    "Project type:",
    "City:",
    "Approx. quantity / scope:",
    "",
    "Please share what you have available.",
  ].join("\n");
}

// =============================================================
// DEEPLINK BUILDER
// =============================================================

export type WhatsAppDeeplinkInput =
  | { template: "product"; product: ProductForEnquiry }
  | { template: "trade-access" }
  | { template: "catalog-request" };

/**
 * Build a wa.me deeplink with a prefilled message.
 *
 * Reads the WhatsApp number from `lib/brand` (which reads from
 * NEXT_PUBLIC_WHATSAPP_NUMBER). If the number is missing, returns "#"
 * so the link still renders but goes nowhere — better than throwing on
 * a static page.
 */
export function buildWhatsAppDeeplink(input: WhatsAppDeeplinkInput): string {
  const number = brand.whatsappNumber;
  if (!number || number === "919999999999") {
    // Placeholder default — link will be inert until the env var is real.
    return "#";
  }

  const message = (() => {
    switch (input.template) {
      case "product":
        return productMessage(input.product, brand.siteUrl);
      case "trade-access":
        return tradeAccessMessage();
      case "catalog-request":
        return catalogRequestMessage();
    }
  })();

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
