"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import type { ProductForEnquiry } from "@/lib/whatsapp";

type FloatingProductCTAProps = {
  productId: string;
  product: ProductForEnquiry;
};

const SHOW_AFTER_FRAC = 0.1; // 10% of page scrolled

/**
 * Mobile-only circular floating WhatsApp CTA on the PDP.
 * Hidden by default. Fades in once the user has scrolled past 10% of the
 * page height. Sits bottom-right (matches the global FloatingWhatsApp on
 * non-PDP routes — not visible at the same time because that one
 * suppresses itself on /products/[slug]).
 */
export function FloatingProductCTA({
  productId,
  product,
}: FloatingProductCTAProps) {
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <WhatsAppCTA
            variant="floating"
            template="product"
            source="pdp"
            productId={productId}
            product={product}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
