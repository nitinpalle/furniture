"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
};

/**
 * Product image gallery. Single component handles 1..N images.
 *
 * Mobile: full-width swipeable carousel with dot indicators.
 * Desktop: hero image + thumbnail strip on the side. Sticky positioning
 *          is applied by the parent container (the page composes it).
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const safe = images.length > 0 ? images : [""];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="hidden lg:block">
        <DesktopGallery images={safe} alt={alt} />
      </div>
      <div className="lg:hidden">
        <MobileGallery images={safe} alt={alt} />
      </div>
    </div>
  );
}

// ============================================================
// DESKTOP — hero + thumbnails
// ============================================================

function DesktopGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const cover = images[active];

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex w-20 shrink-0 flex-col gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                active === i
                  ? "border-[var(--color-accent)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
              )}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-[var(--color-accent-soft)] absolute inset-0" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="bg-[var(--color-accent-soft)] relative aspect-[4/3] flex-1 overflow-hidden rounded-lg">
        {cover ? (
          <Image
            src={cover}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="text-[var(--color-fg-subtle)] absolute inset-0 flex items-center justify-center text-sm">
            No image
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MOBILE — embla swipeable
// ============================================================

function MobileGallery({ images, alt }: { images: string[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);
  const snapCount = images.length;

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-[4/3] min-w-0 flex-[0_0_100%]">
              <div className="bg-[var(--color-accent-soft)] absolute inset-0 overflow-hidden">
                {src ? (
                  <Image
                    src={src}
                    alt={`${alt} — image ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {snapCount > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous image"
            className={cn(
              "bg-[var(--color-bg-elevated)]/80 absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 backdrop-blur-sm",
              "border-[var(--color-border)] border shadow-sm",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next image"
            className={cn(
              "bg-[var(--color-bg-elevated)]/80 absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 backdrop-blur-sm",
              "border-[var(--color-border)] border shadow-sm",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="bg-[var(--color-bg-elevated)]/80 flex gap-1.5 rounded-full px-2.5 py-1.5 backdrop-blur-sm">
              {Array.from({ length: snapCount }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    i === selected
                      ? "w-4 bg-[var(--color-fg)]"
                      : "bg-[var(--color-fg-subtle)]/40",
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
