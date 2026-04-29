"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "./ImageLightbox";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
};

type OpenAt = (index: number) => void;

/**
 * Airbnb-style top-hero gallery.
 *
 * Desktop (lg+):
 *   - 1 image  → full-width hero
 *   - 2 images → 2-column split (each ~50%)
 *   - 3 images → 1 large left + 2 stacked right
 *   - 4 images → 1 large left + 3 stacked right
 *   - 5+ images → Airbnb 5-photo collage (1 large left, 4 in 2x2 right)
 *
 * Mobile (<lg): full-width swipeable carousel + thumbnail strip + counter pill.
 *
 * Tapping any image opens a fullscreen ImageLightbox at that index.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const safe = images.filter(Boolean);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openAt: OpenAt = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <div className={cn(className)}>
      <div className="hidden lg:block">
        <DesktopCollage images={safe} alt={alt} openAt={openAt} />
      </div>
      <div className="lg:hidden">
        <MobileGallery
          images={safe.length > 0 ? safe : [""]}
          alt={alt}
          openAt={openAt}
        />
      </div>
      {safe.length > 0 && (
        <ImageLightbox
          images={safe}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={alt}
        />
      )}
    </div>
  );
}

// ============================================================
// DESKTOP — collage that adapts to image count
// ============================================================

type CollageProps = {
  images: string[];
  alt: string;
  openAt: OpenAt;
};

function DesktopCollage({ images, alt, openAt }: CollageProps) {
  if (images.length === 0) {
    return (
      <div className="bg-[var(--color-accent-soft)] flex aspect-[16/9] items-center justify-center rounded-xl">
        <p className="text-[var(--color-fg-subtle)] text-sm">No image</p>
      </div>
    );
  }

  // Fixed responsive heights — keeps gallery inside ~half of typical
  // laptop viewport so the description + inquiry card peek above the fold.
  const heightClass = "h-[380px] md:h-[420px] lg:h-[460px] xl:h-[520px]";

  // 1 image — full-width
  if (images.length === 1) {
    return (
      <ImageTile
        src={images[0]}
        alt={alt}
        priority
        sizes="(max-width: 1024px) 100vw, 90vw"
        onClick={() => openAt(0)}
        className={cn("w-full overflow-hidden rounded-xl", heightClass)}
      />
    );
  }

  // 2 images — 2-column split
  if (images.length === 2) {
    return (
      <div className={cn("grid grid-cols-2 gap-2 overflow-hidden rounded-xl", heightClass)}>
        {images.map((src, i) => (
          <ImageTile
            key={src + i}
            src={src}
            alt={`${alt} — image ${i + 1}`}
            priority={i === 0}
            sizes="50vw"
            onClick={() => openAt(i)}
            className="h-full overflow-hidden"
          />
        ))}
      </div>
    );
  }

  // 3-4 images — 1 large left, rest stacked right
  if (images.length < 5) {
    return (
      <div className={cn("grid grid-cols-2 gap-2 overflow-hidden rounded-xl", heightClass)}>
        <ImageTile
          src={images[0]}
          alt={`${alt} — main`}
          priority
          sizes="50vw"
          onClick={() => openAt(0)}
          className="h-full overflow-hidden"
        />
        <div className="flex h-full flex-col gap-2">
          {images.slice(1).map((src, i) => (
            <ImageTile
              key={src + i}
              src={src}
              alt={`${alt} — image ${i + 2}`}
              sizes="50vw"
              onClick={() => openAt(i + 1)}
              className="flex-1 overflow-hidden"
            />
          ))}
        </div>
      </div>
    );
  }

  // 5+ images — Airbnb-style: 1 large left, 4 in 2x2 right
  return (
    <div className={cn("grid grid-cols-2 gap-2 overflow-hidden rounded-xl", heightClass)}>
      <ImageTile
        src={images[0]}
        alt={`${alt} — main`}
        priority
        sizes="50vw"
        onClick={() => openAt(0)}
        className="h-full overflow-hidden"
      />
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {images.slice(1, 5).map((src, i) => (
          <ImageTile
            key={src + i}
            src={src}
            alt={`${alt} — image ${i + 2}`}
            sizes="25vw"
            onClick={() => openAt(i + 1)}
            className="overflow-hidden"
            overlay={
              i === 3 && images.length > 5 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-sm font-medium text-white">
                    +{images.length - 5} more
                  </span>
                </div>
              ) : null
            }
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MOBILE — embla swipeable
// ============================================================

type MobileGalleryProps = {
  images: string[];
  alt: string;
  openAt: OpenAt;
};

function MobileGallery({ images, alt, openAt }: MobileGalleryProps) {
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

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  return (
    <div>
      {/* Swipeable hero — 1:1 aspect on mobile (Halden style) */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => src && openAt(i)}
                aria-label={`View image ${i + 1} fullscreen`}
                className="relative aspect-square min-w-0 flex-[0_0_100%] cursor-zoom-in p-0 text-left"
              >
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
              </button>
            ))}
          </div>
        </div>

        {/* Counter pill top-right */}
        {snapCount > 1 && (
          <div
            className={cn(
              "absolute right-3 top-3 pointer-events-none",
              "bg-black/55 text-white backdrop-blur-md",
              "rounded-full px-2.5 py-1 font-mono text-[11px] tracking-wide",
            )}
          >
            {String(selected + 1).padStart(2, "0")} /{" "}
            {String(snapCount).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Thumbnail strip below */}
      {snapCount > 1 && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-1 pt-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={selected === i}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-md transition-all",
                "border-2",
                selected === i
                  ? "border-[var(--color-accent)] opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-[var(--color-accent-soft)] h-full w-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Shared tile component — clickable image that opens lightbox
// ============================================================

type ImageTileProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  onClick: () => void;
  overlay?: React.ReactNode;
};

function ImageTile({
  src,
  alt,
  className,
  priority,
  sizes,
  onClick,
  overlay,
}: ImageTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${alt} fullscreen`}
      className={cn(
        "group bg-[var(--color-accent-soft)] relative cursor-zoom-in p-0 text-left",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-cover transition-transform duration-500",
          "group-hover:scale-[1.02]",
        )}
      />
      {overlay}
    </button>
  );
}
