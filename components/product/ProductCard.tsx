import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import type { ProductCardData } from "@/lib/products";

type ProductCardProps = {
  product: ProductCardData;
  source: "card" | "pdp";
  className?: string;
};

/**
 * Product card used in the listing grid + similar products carousel.
 * Square 1:1 image with country flag overlay, dual-action:
 *   - tap image / name → /products/[slug]
 *   - tap "Enquire" button → opens WhatsApp directly (skips PDP)
 */
export function ProductCard({ product, source, className }: ProductCardProps) {
  const cover = product.image_urls?.[0];
  const flag = flagFor(product.country_of_origin);

  return (
    <article
      className={cn(
        "group bg-[var(--color-bg-elevated)] border-[var(--color-border)] flex flex-col overflow-hidden rounded-lg border",
        "transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="bg-[var(--color-accent-soft)] absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--color-fg-subtle)] text-xs">
              No image
            </span>
          </div>
        )}
        {flag && (
          <span
            className="bg-[var(--color-bg-elevated)]/90 absolute right-2 top-2 inline-flex items-center justify-center rounded-full px-2 py-1 text-xs leading-none backdrop-blur-sm"
            aria-label={`Country of origin: ${product.country_of_origin}`}
          >
            <span aria-hidden>{flag}</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="group/title block"
        >
          <h3
            className={cn(
              "text-[var(--color-fg)] line-clamp-1 text-sm font-medium",
              "group-hover/title:text-[var(--color-accent)] transition-colors",
            )}
          >
            {product.name}
          </h3>
          <p className="text-[var(--color-fg-subtle)] mt-0.5 text-[11px] leading-tight">
            {product.sku} · {product.dimensions}
          </p>
        </Link>

        <WhatsAppCTA
          variant="compact"
          template="product"
          source={source}
          productId={product.id}
          product={{
            slug: product.slug,
            name: product.name,
            sku: product.sku ?? null,
            dimensions: product.dimensions ?? null,
          }}
          className="w-full"
        >
          Enquire
        </WhatsAppCTA>
      </div>
    </article>
  );
}
