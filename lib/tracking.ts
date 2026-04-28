"use client";

import type { EnquiryClickSource } from "@/lib/whatsapp";

/**
 * Fire-and-forget click logger. Does NOT block the user — they navigate
 * to WhatsApp regardless of whether this succeeds.
 *
 * Uses navigator.sendBeacon when available (survives page navigation);
 * falls back to fetch with keepalive.
 */
export function trackEnquiryClick(input: {
  productId?: string | null;
  source: EnquiryClickSource;
}) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    product_id: input.productId ?? null,
    source: input.source,
    referrer: document.referrer || null,
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track-click", blob);
      if (ok) return;
    }
    // Fallback for browsers without sendBeacon (rare).
    void fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking is best-effort — never block the user on a failure.
  }
}
