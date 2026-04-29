"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { WhatsAppCTA } from "./WhatsAppCTA";

const SHOW_AFTER_PX = 240;

// Routes where the floating button is suppressed because the page already
// has a more contextual WhatsApp CTA (avoids two CTAs stacking).
const SUPPRESS_PREFIXES = ["/products/"];

/**
 * Sitewide bottom-right floating WhatsApp button.
 * Fades in after the user scrolls past the hero and stays visible while
 * they browse. Hidden on PDPs (which have their own sticky bottom CTA on
 * mobile and an inline inquiry card on desktop).
 */
export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const suppressed =
    pathname !== "/products" &&
    SUPPRESS_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (suppressed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <WhatsAppCTA
            variant="floating"
            template="trade-access"
            source="floating"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
