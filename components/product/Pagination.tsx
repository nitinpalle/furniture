import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
};

/**
 * Pagination — server-rendered Links. Pure URL state (?page=N).
 * Skipped when totalPages <= 1.
 */
export function Pagination({
  page,
  totalPages,
  searchParams,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else if (v != null) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = pagesAround(page, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <PageBtn
        href={page > 1 ? buildUrl(page - 1) : null}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="text-[var(--color-fg-subtle)] px-2 text-sm"
            aria-hidden
          >
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            href={buildUrl(p)}
            current={p === page}
            ariaLabel={`Page ${p}`}
          >
            {p}
          </PageBtn>
        ),
      )}
      <PageBtn
        href={page < totalPages ? buildUrl(page + 1) : null}
        ariaLabel="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageBtn>
    </nav>
  );
}

function PageBtn({
  href,
  current,
  ariaLabel,
  children,
}: {
  href: string | null;
  current?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors",
    current
      ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)] cursor-default"
      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)]",
    !href && "pointer-events-none opacity-40",
  );

  if (!href) {
    return (
      <span className={cls} aria-disabled aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cls}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

/** Returns a windowed page list with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12] */
function pagesAround(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}
