"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageLightboxProps = {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  alt: string;
};

/**
 * Full-screen image viewer. Tapping any product image opens it here.
 * Swipe to navigate on mobile; arrow keys + buttons on desktop.
 * Esc / X / backdrop tap closes.
 */
export function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
  alt,
}: ImageLightboxProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: initialIndex,
  });
  const [selected, setSelected] = useState(initialIndex);

  // Sync selected index from embla
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Jump to the right image whenever the lightbox opens.
  // Embla's `select` event fires after scrollTo and updates `selected`
  // via the subscription above, so no explicit setSelected here.
  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(initialIndex, true);
    }
  }, [open, initialIndex, emblaApi]);

  // Esc + arrow keys + scroll lock while open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const pillCls = cn(
    "inline-flex items-center justify-center rounded-full",
    "bg-white/15 text-white backdrop-blur-md",
    "transition-colors hover:bg-white/25",
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          {/* Counter (top-left) */}
          {images.length > 1 && (
            <div
              className={cn(
                pillCls,
                "absolute left-4 top-4 z-10 px-3 py-1.5 font-mono text-xs",
              )}
            >
              {String(selected + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </div>
          )}

          {/* Close (top-right) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(pillCls, "absolute right-4 top-4 z-10 h-11 w-11")}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          {/* Swipe area */}
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {images.map((src, i) => (
                <div
                  key={src + i}
                  className="relative flex h-full min-w-0 flex-[0_0_100%] items-center justify-center p-4"
                  onClick={(e) => {
                    // Tap on backdrop (outside image) closes; tap on image
                    // does nothing (lets the user pinch-zoom natively).
                    if (e.target === e.currentTarget) onClose();
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: i === initialIndex ? 0 : 0.04 }}
                    className="relative h-full w-full"
                    style={{ touchAction: "pinch-zoom" }}
                  >
                    <Image
                      src={src}
                      alt={`${alt} — image ${i + 1}`}
                      fill
                      sizes="100vw"
                      priority={i === initialIndex}
                      className="object-contain"
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next (desktop) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous image"
                className={cn(
                  pillCls,
                  "absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 lg:inline-flex",
                )}
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next image"
                className={cn(
                  pillCls,
                  "absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 lg:inline-flex",
                )}
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}

          {/* Caption hint at the bottom (mobile) */}
          <p className="text-white/50 absolute bottom-4 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest sm:block">
            Tap outside to close · Swipe to navigate
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
