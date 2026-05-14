import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CatalogIndexRow = {
  number: string;
  name: string;
  slug: string;
  descriptor: string;
  count: number;
  cover: string | null;
};

type CatalogIndexProps = {
  rows: CatalogIndexRow[];
};

/**
 * The Index — the homepage centerpiece.
 *
 * Reads like the table of contents of a print catalog: large display number,
 * category name in serif, descriptor in mono, count + arrow on the right.
 * On lg+ a small product image fades in to the right of the row on hover.
 *
 * Rendered as a server component; the row hover is pure CSS so nothing
 * touches the React tree as the user moves through the list.
 */
export function CatalogIndex({ rows }: CatalogIndexProps) {
  return (
    <ul className="iv-stagger divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {rows.map((row) => (
        <li key={row.slug} className="iv">
          <Link
            href={`/categories/${row.slug}`}
            className={cn(
              "group/row relative grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6 md:py-8 lg:grid-cols-[7rem_1fr_auto_3rem] lg:gap-8 lg:py-10",
              "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
              "hover:bg-[var(--color-bg-elevated)]",
            )}
          >
            {/* Number */}
            <span className="font-[var(--font-display)] text-2xl font-light tracking-tight text-[var(--color-fg-subtle)] tabular-nums md:text-3xl lg:text-4xl">
              {row.number}
            </span>

            {/* Name + descriptor */}
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-[var(--font-display)] text-3xl font-light leading-[1.04] tracking-tight md:text-4xl lg:text-5xl",
                  "transition-[color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                  "group-hover/row:text-[var(--color-accent)] lg:group-hover/row:translate-x-1",
                )}
              >
                {row.name}
              </h3>
              <p className="mt-1.5 hidden text-[12px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] md:block">
                {row.descriptor}
              </p>
            </div>

            {/* Count */}
            <div className="text-right">
              <p className="font-[var(--font-display)] text-xl font-light tabular-nums md:text-2xl">
                {row.count}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                Piece{row.count === 1 ? "" : "s"}
              </p>
            </div>

            {/* Arrow + image peek (lg only) */}
            <div className="relative hidden h-14 w-14 items-center justify-end lg:flex">
              {row.cover && (
                <span
                  className={cn(
                    "absolute right-16 top-1/2 hidden h-20 w-28 -translate-y-1/2 overflow-hidden rounded-sm border border-[var(--color-border)]",
                    "opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                    "group-hover/row:translate-x-2 group-hover/row:opacity-100 xl:block",
                  )}
                  aria-hidden
                >
                  <Image
                    src={row.cover}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </span>
              )}
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-fg-muted)]",
                  "transition-[color,background-color,border-color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                  "group-hover/row:-translate-y-0.5 group-hover/row:border-[var(--color-fg)] group-hover/row:bg-[var(--color-fg)] group-hover/row:text-[var(--color-bg)]",
                )}
              >
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
