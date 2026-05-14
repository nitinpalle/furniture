import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "@/lib/products";

type ProductGridProps = {
  products: ProductCardData[];
  source: "card" | "pdp";
  className?: string;
  /** Render a "no results" empty state when products is empty. Defaults to true. */
  showEmpty?: boolean;
  /**
   * When true, each card mounts with a staggered fade-up reveal
   * (relies on globals.css .iv + .iv-stagger and the InViewReveal hook).
   * Defaults to true; pass false for grids that should appear instantly
   * (e.g. loaded inside a paginated/filterable surface where the user
   * triggered the change themselves).
   */
  reveal?: boolean;
};

/**
 * Responsive product grid. 2 cols mobile / 3 tablet / 4 desktop / 5 wide-desktop.
 * Used by /products listing, category pages, series pages.
 */
export function ProductGrid({
  products,
  source,
  className,
  showEmpty = true,
  reveal = true,
}: ProductGridProps) {
  if (products.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] py-20 text-center">
        <p className="eyebrow-muted">No products</p>
        <h2 className="mt-3 font-[var(--font-display)] text-xl font-medium">
          Nothing matches yet.
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-fg-muted)]">
          Try removing a filter, clearing the search, or browsing all products.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5",
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        reveal && "iv-stagger",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          source={source}
          className={reveal ? "iv" : undefined}
        />
      ))}
    </div>
  );
}
