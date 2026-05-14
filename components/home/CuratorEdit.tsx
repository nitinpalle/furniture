import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";
import type { ProductCardData } from "@/lib/products";

type EditEntry = ProductCardData & {
  number: string;
  caption?: string;
};

type CuratorEditProps = {
  entries: EditEntry[];
};

/**
 * Four-piece vertical editorial showcase. Each row alternates image-left /
 * image-right and feels like a single magazine spread per product:
 *
 *   ┌───────────┐  № 04
 *   │  IMAGE    │  Halden Refectory Table.
 *   │           │  ── data callouts ──
 *   └───────────┘  Enquire about this piece →
 *
 * Pulls live data from `getFeaturedProducts` so this stays in sync with
 * what's actually in the catalog.
 */
export function CuratorEdit({ entries }: CuratorEditProps) {
  return (
    <ul className="iv-stagger flex flex-col gap-20 lg:gap-32">
      {entries.map((p, i) => {
        const cover = p.image_urls?.[0];
        const flag = flagFor(p.country_of_origin);
        const reverse = i % 2 === 1;

        return (
          <li key={p.id} className="iv">
            <article
              className={cn(
                "grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
                reverse && "lg:[&>*:first-child]:order-2",
              )}
            >
              {/* Image */}
              <Link
                href={`/products/${p.slug}`}
                className="group/edit relative block aspect-[4/5] overflow-hidden rounded-lg bg-[var(--color-bg-elevated)] lg:aspect-[5/6]"
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover/edit:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-accent-soft)]">
                    <span className="text-xs uppercase tracking-widest text-[var(--color-fg-subtle)]">
                      Image coming soon
                    </span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="lg:px-2">
                <p className="font-[var(--font-display)] text-2xl font-light tabular-nums text-[var(--color-fg-subtle)] lg:text-3xl">
                  {p.number}
                </p>
                <h3 className="mt-3 font-[var(--font-display)] text-3xl font-light leading-[1.05] tracking-tight md:text-4xl lg:text-5xl">
                  {p.name}.
                </h3>
                {p.caption && (
                  <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-fg-muted)]">
                    {p.caption}
                  </p>
                )}

                {/* Data callouts */}
                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--color-border)] pt-6 max-w-md">
                  {p.country_of_origin && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                        Made in
                      </dt>
                      <dd className="mt-1.5 text-sm font-medium">
                        {flag && <span className="mr-1.5" aria-hidden>{flag}</span>}
                        {p.country_of_origin}
                      </dd>
                    </div>
                  )}
                  {p.dimensions && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                        Dimensions
                      </dt>
                      <dd className="mt-1.5 text-sm font-medium">
                        {p.dimensions}
                      </dd>
                    </div>
                  )}
                  {p.capacity && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                        Capacity
                      </dt>
                      <dd className="mt-1.5 text-sm font-medium">{p.capacity}</dd>
                    </div>
                  )}
                  {p.sku && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                        Sku
                      </dt>
                      <dd className="mt-1.5 font-mono text-sm font-medium">
                        {p.sku}
                      </dd>
                    </div>
                  )}
                </dl>

                <Link
                  href={`/products/${p.slug}`}
                  className={cn(
                    "mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] uline",
                    "transition-colors duration-[var(--duration-fast)]",
                    "hover:text-[var(--color-accent)]",
                  )}
                >
                  Enquire about this piece
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
