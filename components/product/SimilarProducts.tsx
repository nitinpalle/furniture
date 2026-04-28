"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "@/lib/products";

type SimilarProductsProps = {
  products: ProductCardData[];
  heading?: string;
};

/**
 * Horizontally scrollable carousel of related products.
 * Mobile: 2 visible per slide. Desktop: 3+. User said "at least 4" but
 * with the 50/50 PDP layout the right panel is half the viewport — fitting
 * 4 product cards there at lg requires very narrow cards, so we show
 * 2 (md) / 3 (lg) / 4 (xl). Beyond that becomes claustrophobic.
 */
export function SimilarProducts({
  products,
  heading = "Similar products",
}: SimilarProductsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  // Initial state assumes the user is at the start; embla fires `reInit`
  // shortly after mount which corrects these via the event handler below.
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(products.length > 1);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--color-fg)] text-base font-semibold">
          {heading}
        </h2>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous"
            className={cn(
              "border-[var(--color-border)] hover:bg-[var(--color-accent-soft)] inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label="Next"
            className={cn(
              "border-[var(--color-border)] hover:bg-[var(--color-accent-soft)] inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 sm:gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={cn(
                "min-w-0",
                "flex-[0_0_calc((100%-0.75rem)/2)]",          // mobile: 2 per view
                "sm:flex-[0_0_calc((100%-0.75rem*1)/2)]",     // sm: 2
                "md:flex-[0_0_calc((100%-1rem*2)/3)]",        // md: 3
                "xl:flex-[0_0_calc((100%-1rem*3)/4)]",        // xl: 4
              )}
            >
              <ProductCard product={p} source="card" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
