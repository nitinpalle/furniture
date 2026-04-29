"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";

type FilterPanelProps = {
  capacities: string[];
  countries: string[];
  /** When provided, overrides the default basePath (used to wire the form to a specific listing). */
  basePath?: string;
  className?: string;
  /** Called after each toggle. Useful to close the mobile sheet. */
  onChange?: () => void;
};

/**
 * URL-state-driven filter panel. Reads/writes the same query params that
 * /products and /categories listings consume. Multi-value filters comma-encode.
 *
 * Single component for both desktop sidebar and mobile bottom-sheet —
 * the parent decides how to position and toggle visibility.
 */
export function FilterPanel({
  capacities,
  countries,
  basePath,
  className,
  onChange,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCapacities = useMemo(
    () => searchParams.get("capacity")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const selectedCountries = useMemo(
    () => searchParams.get("country")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const projectType = searchParams.get("project") ?? "";
  const search = searchParams.get("q") ?? "";
  const hasAny =
    selectedCapacities.length > 0 ||
    selectedCountries.length > 0 ||
    projectType.length > 0;

  const updateParam = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (values.length === 0) {
        params.delete(key);
      } else {
        params.set(key, values.join(","));
      }
      // Reset pagination on filter change
      params.delete("page");
      const path = basePath ?? window.location.pathname;
      router.push(`${path}?${params.toString()}`, { scroll: false });
      onChange?.();
    },
    [searchParams, router, basePath, onChange],
  );

  const toggle = (key: "capacity" | "country", value: string) => {
    const current = key === "capacity" ? selectedCapacities : selectedCountries;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParam(key, next);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const path = basePath ?? window.location.pathname;
    router.push(`${path}${params.size > 0 ? "?" + params.toString() : ""}`, {
      scroll: false,
    });
    onChange?.();
  };

  return (
    <div className={cn("space-y-7", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--color-fg)] text-sm font-semibold">Filters</h2>
        {hasAny && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] inline-flex items-center gap-1 text-xs"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {capacities.length > 0 && (
        <FilterSection
          title="Capacity"
          options={capacities}
          selected={selectedCapacities}
          onToggle={(v) => toggle("capacity", v)}
        />
      )}

      {countries.length > 0 && (
        <FilterSection
          title="Country of origin"
          options={countries}
          selected={selectedCountries}
          onToggle={(v) => toggle("country", v)}
          renderLabel={(v) => `${flagFor(v) || ""} ${v}`.trim()}
        />
      )}

      <FilterSection
        title="Project type"
        options={["hospitality", "residential", "office", "restaurant"]}
        selected={projectType ? [projectType] : []}
        onToggle={(v) => {
          updateParam("project", projectType === v ? [] : [v]);
        }}
        renderLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
      />
    </div>
  );
}

// ============================================================
// FilterSection
// ============================================================

function FilterSection({
  title,
  options,
  selected,
  onToggle,
  renderLabel,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  renderLabel?: (v: string) => string;
}) {
  return (
    <fieldset>
      <legend className="text-[var(--color-fg-subtle)] mb-3 block text-xs font-semibold uppercase tracking-widest">
        {title}
      </legend>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm",
                "hover:bg-[var(--color-accent-soft)]",
                "transition-colors duration-100",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt)}
                className="border-[var(--color-border-strong)] text-[var(--color-fg)] h-4 w-4 rounded border focus:ring-[var(--color-accent)]"
              />
              <span className={cn("flex-1", checked && "font-medium")}>
                {renderLabel ? renderLabel(opt) : opt}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
