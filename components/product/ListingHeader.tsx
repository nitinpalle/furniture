"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ListingHeaderProps = {
  total: number;
  basePath?: string;
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name A–Z" },
];

/**
 * The bar above the product grid.
 * Left: result count.
 * Center: search input (uncontrolled — URL is source of truth).
 * Right: sort dropdown.
 */
export function ListingHeader({ total, basePath }: ListingHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialSearch = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

  function applySearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    params.delete("page");
    const path = basePath ?? window.location.pathname;
    router.push(`${path}?${params.toString()}`, { scroll: false });
  }

  function applySort(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "featured") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    const path = basePath ?? window.location.pathname;
    router.push(`${path}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border-[var(--color-border)] flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-[var(--color-fg-muted)] text-sm">
        {total === 0 ? "No products" : `${total} product${total === 1 ? "" : "s"}`}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          applySearch(inputRef.current?.value ?? "");
        }}
        className={cn(
          "border-[var(--color-border-strong)] hover:border-[var(--color-fg-muted)] focus-within:border-[var(--color-fg)] flex w-full items-center gap-2 rounded-md border bg-[var(--color-bg-elevated)] px-3 transition-colors lg:max-w-md",
        )}
      >
        <Search className="text-[var(--color-fg-subtle)] h-4 w-4 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          // key forces a remount when the URL search param changes externally
          // so the uncontrolled input picks up the new defaultValue.
          key={initialSearch}
          type="search"
          defaultValue={initialSearch}
          name="q"
          placeholder="Search by name, SKU, or description"
          className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[var(--color-fg-subtle)]"
        />
        {initialSearch && (
          <button
            type="button"
            onClick={() => applySearch("")}
            aria-label="Clear search"
            className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] -mr-1 p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-2">
        <label
          htmlFor="sort"
          className="text-[var(--color-fg-muted)] text-xs uppercase tracking-wide"
        >
          Sort
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => applySort(e.target.value)}
          className={cn(
            "border-[var(--color-border-strong)] hover:border-[var(--color-fg-muted)] rounded-md border bg-[var(--color-bg-elevated)] px-3 py-2 text-sm",
          )}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
