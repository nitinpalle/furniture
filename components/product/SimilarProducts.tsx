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
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">In the same room</p>
          <h2 className="display-3 font-medium tracking-tight">{heading}</h2>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-strong)]",
              "transition-[transform,background-color,color,border-color] duration-[var(--duration-fast)]",
              "hover:-translate-y-0.5 hover:border-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]",
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
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-strong)]",
              "transition-[transform,background-color,color,border-color] duration-[var(--duration-fast)]",
              "hover:-translate-y-0.5 hover:border-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        {/*
          Peek-edge values: each slide is sized so a fraction of the next
          slide is visible, signalling there's more to scroll.
            mobile: 2.2 cards visible
            md:     3.2 cards
            lg:     4.2 cards
            xl:     4.5 cards
        */}
        <div className="flex gap-3 sm:gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={cn(
                "min-w-0",
                "flex-[0_0_45%]",       // mobile: 2.2 visible
                "sm:flex-[0_0_42%]",    // sm: ~2.4
                "md:flex-[0_0_30%]",    // md: ~3.3
                "lg:flex-[0_0_23%]",    // lg: ~4.3
                "xl:flex-[0_0_22%]",    // xl: ~4.5
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
