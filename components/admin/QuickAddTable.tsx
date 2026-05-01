"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { createProductsBulk, type BulkCreateRow } from "@/lib/admin/actions";

type CategoryLite = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type Row = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  dimensions: string;
  capacity: string;
  status: "draft" | "published";
};

const emptyRow: Row = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  subcategoryId: "",
  dimensions: "",
  capacity: "",
  status: "draft",
};

type QuickAddTableProps = {
  topCategories: { id: string; name: string }[];
  subcategories: CategoryLite[];
};

export function QuickAddTable({
  topCategories,
  subcategories,
}: QuickAddTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow, { ...emptyRow }, { ...emptyRow }]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof Row>(i: number, key: K, value: Row[K]) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      // Auto-derive slug while user hasn't manually edited it
      if (key === "name" && (!next[i].slug || next[i].slug === slugify(prev[i].name))) {
        next[i].slug = slugify(value as string);
      }
      // Reset subcategory when category changes
      if (key === "categoryId") {
        next[i].subcategoryId = "";
      }
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, j) => j !== i)));
  }

  const filledRowCount = useMemo(
    () => rows.filter((r) => r.name.trim() && r.slug.trim()).length,
    [rows],
  );

  function onSubmit() {
    setServerError(null);
    setResult(null);
    const payload: BulkCreateRow[] = rows
      .filter((r) => r.name.trim() && r.slug.trim())
      .map((r) => ({
        name: r.name.trim(),
        slug: r.slug.trim(),
        sku: r.sku.trim() || null,
        category_id: r.categoryId || null,
        subcategory_id: r.subcategoryId || null,
        dimensions: r.dimensions.trim() || null,
        capacity: r.capacity.trim() || null,
        status: r.status,
      }));

    if (payload.length === 0) {
      setServerError("Add at least one row with a name.");
      return;
    }

    startTransition(async () => {
      const res = await createProductsBulk(payload);
      if (!res.ok) {
        setServerError(res.error);
        if (res.errors) {
          setResult({
            created: res.created,
            skipped: res.errors.length,
            errors: res.errors,
          });
        }
        return;
      }
      setResult({
        created: res.created,
        skipped: res.skipped,
        errors: res.errors,
      });
      // Reset rows so the table is empty after a successful submit
      setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Status banners */}
      {result && (
        <div
          role="status"
          className={cn(
            "rounded-md border p-3 text-xs",
            result.errors.length > 0
              ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
              : "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]",
          )}
        >
          ✓ Created {result.created}{" "}
          {result.created === 1 ? "product" : "products"}.
          {result.errors.length > 0 && (
            <>
              {" "}Skipped {result.skipped}:
              <ul className="mt-2 list-inside list-disc">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {serverError && (
        <div
          role="alert"
          className="border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-md border p-3 text-xs"
        >
          {serverError}
        </div>
      )}

      {/* Table */}
      <div className="border-[var(--color-border)] overflow-x-auto rounded-lg border bg-[var(--color-bg-elevated)]">
        <table className="w-full text-sm">
          <thead className="border-[var(--color-border)] bg-[var(--color-bg)] border-b">
            <tr className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-widest">
              <th className="p-2 text-left">Name *</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Sub-category</th>
              <th className="p-2 text-left">Dimensions</th>
              <th className="p-2 text-left">Capacity</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-[var(--color-border)] divide-y">
            {rows.map((row, i) => {
              const subs = subcategories.filter(
                (s) => s.parent_id === row.categoryId,
              );
              return (
                <tr key={i}>
                  <td className="p-1.5">
                    <input
                      className={inputCls}
                      value={row.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      placeholder="Product name"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      className={cn(inputCls, "font-mono text-xs")}
                      value={row.slug}
                      onChange={(e) => update(i, "slug", e.target.value)}
                      placeholder="auto"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      className={cn(inputCls, "font-mono text-xs")}
                      value={row.sku}
                      onChange={(e) => update(i, "sku", e.target.value)}
                    />
                  </td>
                  <td className="p-1.5">
                    <select
                      className={inputCls}
                      value={row.categoryId}
                      onChange={(e) => update(i, "categoryId", e.target.value)}
                    >
                      <option value="">—</option>
                      {topCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5">
                    <select
                      className={inputCls}
                      value={row.subcategoryId}
                      onChange={(e) =>
                        update(i, "subcategoryId", e.target.value)
                      }
                      disabled={!row.categoryId}
                    >
                      <option value="">—</option>
                      {subs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5">
                    <input
                      className={inputCls}
                      value={row.dimensions}
                      onChange={(e) => update(i, "dimensions", e.target.value)}
                      placeholder="W × D × H cm"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      className={inputCls}
                      value={row.capacity}
                      onChange={(e) => update(i, "capacity", e.target.value)}
                      placeholder="Seats N"
                    />
                  </td>
                  <td className="p-1.5">
                    <select
                      className={inputCls}
                      value={row.status}
                      onChange={(e) =>
                        update(i, "status", e.target.value as Row["status"])
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </td>
                  <td className="p-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={rows.length === 1}
                      aria-label="Remove row"
                      className="text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-30"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium"
        >
          <Plus className="h-3 w-3" />
          Add row
        </button>
        <div className="flex items-center gap-3">
          <p className="text-[var(--color-fg-muted)] text-xs">
            {filledRowCount} of {rows.length}{" "}
            {rows.length === 1 ? "row" : "rows"} ready
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending || filledRowCount === 0}
            className={cn(
              "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)] inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-xs font-semibold",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {pending
              ? "Creating…"
              : `Create ${filledRowCount} ${filledRowCount === 1 ? "product" : "products"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-md border bg-transparent px-2 py-1.5 text-xs",
  "border-[var(--color-border)] focus:border-[var(--color-fg)] focus:outline-none",
);
