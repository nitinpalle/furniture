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
 * Airbnb-style top-hero gallery.
 *
 * Desktop (lg+):
 *   - 1 image  → full-width 16:9 hero
 *   - 2 images → 2-column split (each ~50%)
 *   - 3 images → 1 large left + 2 stacked right
 *   - 4 images → 1 large left + 3 stacked right
 *   - 5+ images → Airbnb 5-photo collage (1 large left, 4 in 2x2 right)
 *
 * Mobile (<lg): full-width swipeable carousel with chevrons + dot pager.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const safe = images.filter(Boolean);

  return (
    <div className={cn(className)}>
      <div className="hidden lg:block">
        <DesktopCollage images={safe} alt={alt} />
      </div>
      <div className="lg:hidden">
        <MobileGallery images={safe.length > 0 ? safe : [""]} alt={alt} />
      </div>
    </div>
  );
}

// ============================================================
// DESKTOP — collage that adapts to image count
// ============================================================

function DesktopCollage({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) {
    return (
      <div className="bg-[var(--color-accent-soft)] flex aspect-[16/9] items-center justify-center rounded-xl">
        <p className="text-[var(--color-fg-subtle)] text-sm">No image</p>
      </div>
    );
  }

  // 1 image — full-width 16:9
  if (images.length === 1) {
    return (
      <div className="bg-[var(--color-accent-soft)] relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={images[0]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  // 2 images — 2-column split
  if (images.length === 2) {
    return (
      <div className="grid aspect-[16/8] grid-cols-2 gap-2 overflow-hidden rounded-xl">
        {images.map((src, i) => (
          <div
            key={src + i}
            className="bg-[var(--color-accent-soft)] relative h-full overflow-hidden"
          >
            <Image
              src={src}
              alt={`${alt} — image ${i + 1}`}
              fill
              priority={i === 0}
              sizes="50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3-4 images — 1 large left, rest stacked right
  if (images.length < 5) {
    return (
      <div className="grid aspect-[16/8] grid-cols-2 gap-2 overflow-hidden rounded-xl">
        <div className="bg-[var(--color-accent-soft)] relative h-full overflow-hidden">
          <Image
            src={images[0]}
            alt={`${alt} — main`}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
        <div className="flex h-full flex-col gap-2">
          {images.slice(1).map((src, i) => (
            <div
              key={src + i}
              className="bg-[var(--color-accent-soft)] relative flex-1 overflow-hidden"
            >
              <Image
                src={src}
                alt={`${alt} — image ${i + 2}`}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5+ images — Airbnb-style: 1 large left, 4 in 2x2 right
  return (
    <div className="grid aspect-[16/8] grid-cols-2 gap-2 overflow-hidden rounded-xl">
      <div className="bg-[var(--color-accent-soft)] relative h-full overflow-hidden">
        <Image
          src={images[0]}
          alt={`${alt} — main`}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {images.slice(1, 5).map((src, i) => (
          <div
            key={src + i}
            className="bg-[var(--color-accent-soft)] relative overflow-hidden"
          >
            <Image
              src={src}
              alt={`${alt} — image ${i + 2}`}
              fill
              sizes="25vw"
              className="object-cover"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-sm font-medium text-white">
                  +{images.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
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
