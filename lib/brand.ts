/**
 * Brand constants — single source of truth.
 *
 * Swap these placeholders when the user finalizes brand identity.
 * Anything in the UI that mentions the brand should pull from here,
 * never hardcode strings.
 */

export const brand = {
  name: "Furniture Co.",
  tagline:
    "Contract furniture, curated globally. Sourced from leading factories worldwide. Built for India's hospitality, design, and architecture professionals.",
  shortTagline: "Contract furniture, curated globally.",

  // Public-facing
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // Contact
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",

  // Region defaults
  defaultCountryCode: "+91",
  defaultLocale: "en-IN",
  defaultTimezone: "Asia/Kolkata",

  // Trust strip (homepage)
  trustSignals: [
    "Sourced from 8+ countries",
    "Trusted by hotels, designers & architects",
    "Direct WhatsApp inquiry",
    "Personalized catalog on request",
  ],

  // Hero copy
  hero: {
    headline: "Contract furniture, curated globally.",
    subhead:
      "Sourced from leading factories worldwide. Built for India's hospitality, design, and architecture professionals.",
    primaryCta: { label: "Browse Catalog", href: "/products" },
    secondaryCta: { label: "Request Trade Access", template: "trade-access" as const },
  },
} as const;

export type Brand = typeof brand;
