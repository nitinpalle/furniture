import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "@/lib/products";

type ProductGridProps = {
  products: ProductCardData[];
  source: "card" | "pdp";
  className?: string;
  /** Render a "no results" empty state when products is empty. Defaults to true. */
  showEmpty?: boolean;
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
}: ProductGridProps) {
  if (products.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className="border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-20 text-center">
        <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
          No products
        </p>
        <h2 className="font-[var(--font-display)] mt-2 text-xl font-medium">
          Nothing matches yet.
        </h2>
        <p className="text-[var(--color-fg-muted)] mt-2 max-w-sm text-sm">
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
        "2xl:grid-cols-5",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} source={source} />
      ))}
    </div>
  );
}
