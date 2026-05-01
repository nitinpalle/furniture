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
 *
 * Hover behavior (desktop): subtle card lift + soft shadow ramp; the cover
 * image scales gently and, when a second image exists, crossfades to it.
 * Behavior on touch devices is unchanged (no hover state triggers).
 */
export function ProductCard({ product, source, className }: ProductCardProps) {
  const cover = product.image_urls?.[0];
  const second = product.image_urls?.[1];
  const flag = flagFor(product.country_of_origin);

  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]",
        "transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {cover ? (
          <>
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
              className={cn(
                "object-cover transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]",
                "group-hover/card:scale-[1.06]",
                second ? "group-hover/card:opacity-0" : undefined,
              )}
            />
            {second && (
              <Image
                src={second}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
                className={cn(
                  "object-cover opacity-0 transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]",
                  "group-hover/card:scale-[1.06] group-hover/card:opacity-100",
                )}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-accent-soft)]">
            <span className="text-xs text-[var(--color-fg-subtle)]">
              No image
            </span>
          </div>
        )}
        {flag && (
          <span
            className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)]/90 px-2 py-1 text-xs leading-none backdrop-blur-sm shadow-[var(--shadow-xs)]"
            aria-label={`Country of origin: ${product.country_of_origin}`}
          >
            <span aria-hidden>{flag}</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.slug}`} className="group/title block">
          <h3
            className={cn(
              "line-clamp-1 text-sm font-medium text-[var(--color-fg)]",
              "transition-colors duration-[var(--duration-fast)] group-hover/title:text-[var(--color-accent)]",
            )}
          >
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] leading-tight text-[var(--color-fg-subtle)]">
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
