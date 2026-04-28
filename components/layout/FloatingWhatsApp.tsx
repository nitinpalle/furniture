"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WhatsAppCTA } from "./WhatsAppCTA";

const SHOW_AFTER_PX = 240;

/**
 * Sitewide bottom-right floating WhatsApp button.
 * Fades in after the user scrolls past the hero and stays visible while
 * they browse. Hidden on the homepage's first viewport so it doesn't
 * compete with the hero CTAs.
 */
export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
