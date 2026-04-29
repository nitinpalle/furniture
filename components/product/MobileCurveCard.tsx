"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type MobileCurveCardProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Mobile-only "scoop" container — sits over the bottom of the gallery
 * with rounded top corners, lifted by ~20px so it visually peels back to
 * reveal the image. Matches the Airbnb listing-detail pattern.
 *
 * Animates in with a soft slide-up + fade for a premium first-load feel.
 *
 * Wrap mobile-only content (title, origin row, body) in this component.
 * On lg+ it becomes a transparent passthrough so desktop layout is intact.
 */
export function MobileCurveCard({ children, className }: MobileCurveCardProps) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 0.94, 0.36, 1] }}
      className={cn(
        // Mobile: lifted, rounded top, surface-toned background.
        "-mt-5 relative z-10 rounded-t-3xl bg-[var(--color-bg)] pt-5 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.08)]",
        // Desktop: passthrough — no scoop, no shadow.
        "lg:-mt-0 lg:rounded-none lg:bg-transparent lg:pt-0 lg:shadow-none",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
