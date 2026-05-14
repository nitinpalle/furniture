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
 * Reads like the table of contents of a print catalog: numbered serial,
 * category name in serif, descriptor in mono, count + arrow on the right.
 * On xl+ a small product thumbnail fades in to the right of the row on hover.
 *
 * Sized tightly on desktop so the page doesn't require excessive scrolling
 * — the entire Index fits comfortably above the fold on a typical 1440 view.
 */
export function CatalogIndex({ rows }: CatalogIndexProps) {
  return (
    <ul className="iv-stagger divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {rows.map((row) => (
        <li key={row.slug} className="iv">
          <Link
            href={`/categories/${row.slug}`}
            className={cn(
              "group/row relative grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 md:gap-7 md:py-6 lg:grid-cols-[5rem_1fr_auto_3rem] lg:gap-8 lg:py-7",
              "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
              "hover:bg-[var(--color-bg-elevated)]",
            )}
          >
            {/* Number */}
            <span className="font-[var(--font-display)] text-xl font-light tracking-tight text-[var(--color-fg-subtle)] tabular-nums md:text-2xl">
              {row.number}
            </span>

            {/* Name + descriptor */}
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-[var(--font-display)] text-2xl font-light leading-[1.05] tracking-tight md:text-3xl lg:text-[1.9rem]",
                  "transition-[color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                  "group-hover/row:text-[var(--color-accent)] lg:group-hover/row:translate-x-1",
                )}
              >
                {row.name}
              </h3>
              <p className="mt-1 hidden text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] md:block">
                {row.descriptor}
              </p>
            </div>

            {/* Count */}
            <div className="text-right">
              <p className="font-[var(--font-display)] text-lg font-light tabular-nums md:text-xl">
                {row.count}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
                Piece{row.count === 1 ? "" : "s"}
              </p>
            </div>

            {/* Arrow + image peek (lg only) */}
            <div className="relative hidden h-10 w-10 items-center justify-end lg:flex">
              {row.cover && (
                <span
                  className={cn(
                    "absolute right-14 top-1/2 hidden h-14 w-20 -translate-y-1/2 overflow-hidden rounded-sm border border-[var(--color-border)]",
                    "opacity-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                    "group-hover/row:translate-x-1.5 group-hover/row:opacity-100 xl:block",
                  )}
                  aria-hidden
                >
                  <Image
                    src={row.cover}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </span>
              )}
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-fg-muted)]",
                  "transition-[color,background-color,border-color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
                  "group-hover/row:-translate-y-0.5 group-hover/row:border-[var(--color-fg)] group-hover/row:bg-[var(--color-fg)] group-hover/row:text-[var(--color-bg)]",
                )}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
