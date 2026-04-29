"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppDeeplink,
  type ProductForEnquiry,
} from "@/lib/whatsapp";
import { trackEnquiryClick } from "@/lib/tracking";

type StickyMobileBarProps = {
  productId: string;
  product: ProductForEnquiry;
  moq: number | null;
  leadTimeDays: number | null;
};

const SHOW_AFTER_FRAC = 0.1; // 10% of page scrolled

/**
 * Mobile-only sticky bottom bar (Airbnb-style):
 *   left  → quick info (MOQ + lead time, like Airbnb's "₹15,736 / 5 nights")
 *   right → green Enquire button (like Airbnb's red "Reserve")
 * Slides up after the user scrolls past 10% of the page.
 */
export function StickyMobileBar({
  productId,
  product,
  moq,
  leadTimeDays,
}: StickyMobileBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const threshold =
        (document.documentElement.scrollHeight - window.innerHeight) *
        SHOW_AFTER_FRAC;
      setVisible(scrolled > Math.max(threshold, 80));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const href = buildWhatsAppDeeplink({ template: "product", product });

  function onClick() {
    trackEnquiryClick({ productId, source: "pdp" });
  }

  const infoLines: string[] = [];
  if (moq != null) infoLines.push(`MOQ ${moq}`);
  if (leadTimeDays != null)
    infoLines.push(`${leadTimeDays}–${leadTimeDays + 15} days`);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "border-[var(--color-border)] bg-[var(--color-bg)]/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md",
            "lg:hidden",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[var(--color-fg)] text-sm font-semibold">
                Trade pricing on request
              </p>
              {infoLines.length > 0 && (
                <p className="text-[var(--color-fg-muted)] truncate text-xs">
                  {infoLines.join(" · ")}
                </p>
              )}
            </div>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              className={cn(
                "bg-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-hover)] inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-5 text-sm font-medium text-white shadow-sm",
              )}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Enquire
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
