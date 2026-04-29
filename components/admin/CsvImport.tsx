"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { createProductsBulk, type BulkCreateRow } from "@/lib/admin/actions";

type CsvImportProps = {
  /** Map category slug → id and subcategory slug → id (parent-aware). */
  categoriesBySlug: Record<string, string>;
  subcategoriesBySlug: Record<string, { id: string; parentSlug: string | null }>;
};

const REQUIRED_HEADER = ["name"]; // only name is strictly required
const ALL_HEADERS = [
  "name",
  "slug",
  "sku",
  "category",
  "subcategory",
  "dimensions",
  "capacity",
  "material",
  "color",
  "country_of_origin",
  "status",
];

type ParsedRow = {
  rowNumber: number;
  raw: Record<string, string>;
  payload: BulkCreateRow | null;
  error: string | null;
};

/**
 * Minimal CSV parser. Handles double-quoted values that contain commas
 * but does NOT support escaped quotes inside values. Good enough for
 * B2B catalog imports where data is curated and structured.
 */
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .replace(/^﻿/, "") // strip BOM
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        out.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current.trim());
    return out;
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });

  return { headers, rows };
}

export function CsvImport({
  categoriesBySlug,
  subcategoriesBySlug,
}: CsvImportProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    setHeaderError(null);
    setImportResult(null);
    setServerError(null);
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { headers, rows } = parseCsv(text);

      const missingRequired = REQUIRED_HEADER.filter((h) => !headers.includes(h));
      if (missingRequired.length > 0) {
        setHeaderError(
          `Missing required column(s): ${missingRequired.join(", ")}. Expected at minimum: ${REQUIRED_HEADER.join(", ")}.`,
        );
        setParsed([]);
        return;
      }

      const result: ParsedRow[] = rows.map((raw, idx) => {
        const rowNumber = idx + 2; // header is row 1
        const name = (raw.name ?? "").trim();
        const slug = (raw.slug ?? "").trim() || slugify(name);
        if (!name) {
          return { rowNumber, raw, payload: null, error: "name is empty" };
        }
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
          return { rowNumber, raw, payload: null, error: "invalid slug" };
        }
        const categorySlug = (raw.category ?? "").trim().toLowerCase();
        const subcategorySlug = (raw.subcategory ?? "").trim().toLowerCase();
        const categoryId = categorySlug
          ? (categoriesBySlug[categorySlug] ?? null)
          : null;
        if (categorySlug && !categoryId) {
          return {
            rowNumber,
            raw,
            payload: null,
            error: `unknown category "${categorySlug}"`,
          };
        }
        let subcategoryId: string | null = null;
        if (subcategorySlug) {
          const sub = subcategoriesBySlug[subcategorySlug];
          if (!sub) {
            return {
              rowNumber,
              raw,
              payload: null,
              error: `unknown subcategory "${subcategorySlug}"`,
            };
          }
          if (categorySlug && sub.parentSlug && sub.parentSlug !== categorySlug) {
            return {
              rowNumber,
              raw,
              payload: null,
              error: `subcategory "${subcategorySlug}" doesn't belong to "${categorySlug}"`,
            };
          }
          subcategoryId = sub.id;
        }
        const status = (raw.status ?? "").trim().toLowerCase();
        const validStatus =
          status === "published" || status === "draft" ? status : "draft";

        return {
          rowNumber,
          raw,
          payload: {
            name,
            slug,
            sku: (raw.sku ?? "").trim() || null,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            dimensions: (raw.dimensions ?? "").trim() || null,
            capacity: (raw.capacity ?? "").trim() || null,
            material: (raw.material ?? "").trim() || null,
            color: (raw.color ?? "").trim() || null,
            country_of_origin: (raw.country_of_origin ?? "").trim() || null,
            status: validStatus,
          },
          error: null,
        };
      });

      setParsed(result);
    };
    reader.readAsText(file);
  }

  const validRows = parsed.filter((p) => p.payload !== null);
  const invalidRows = parsed.filter((p) => p.error !== null);

  function onImport() {
    setServerError(null);
    setImportResult(null);
    const payload = validRows
      .map((p) => p.payload)
      .filter((p): p is BulkCreateRow => p !== null);
    if (payload.length === 0) {
      setServerError("No valid rows to import.");
      return;
    }
    startTransition(async () => {
      const res = await createProductsBulk(payload);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      setImportResult({
        created: res.created,
        skipped: res.skipped + invalidRows.length,
        errors: [
          ...res.errors,
          ...invalidRows.map((r) => ({
            row: r.rowNumber,
            message: r.error ?? "invalid",
          })),
        ],
      });
      setParsed([]);
      setFilename(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Format guide */}
      <details className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          CSV format
        </summary>
        <div className="text-[var(--color-fg-muted)] mt-3 space-y-2 text-xs">
          <p>
            First row is the header. Only{" "}
            <code className="font-mono">name</code> is strictly required —
            others are optional. Recognised columns:
          </p>
          <p className="font-mono">{ALL_HEADERS.join(", ")}</p>
          <p>
            <code className="font-mono">category</code> /{" "}
            <code className="font-mono">subcategory</code> use the slug
            (e.g. <code className="font-mono">dining</code>,{" "}
            <code className="font-mono">dining-tables</code>).{" "}
            <code className="font-mono">status</code> is{" "}
            <code className="font-mono">draft</code> or{" "}
            <code className="font-mono">published</code> (defaults to draft).{" "}
            <code className="font-mono">slug</code> is auto-generated from name
            if blank.
          </p>
          <p>
            Values containing commas should be wrapped in double quotes. Images
            and description are added per-product on the edit page after import.
          </p>
          <pre className="bg-[var(--color-bg)] mt-2 overflow-x-auto rounded p-3 font-mono text-[11px]">
            name,slug,sku,category,subcategory,dimensions,status{"\n"}
            Aanvo Dining Set,aanvo-dining-set,AAN-001,dining,dining-tables,&quot;200 × 100 × 76 cm&quot;,draft{"\n"}
            Round Walnut Table,,WAL-201,dining,dining-tables,&quot;150 × 150 × 76 cm&quot;,published
          </pre>
        </div>
      </details>

      {/* File picker */}
      <div className="border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center">
        <FileText className="text-[var(--color-fg-muted)] h-8 w-8" />
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Choose CSV file
        </button>
        {filename && (
          <p className="text-[var(--color-fg-muted)] text-xs">
            Loaded: <span className="font-mono">{filename}</span>
          </p>
        )}
      </div>

      {/* Header error */}
      {headerError && (
        <div
          role="alert"
          className="border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-md border p-3 text-xs"
        >
          {headerError}
        </div>
      )}

      {/* Preview */}
      {parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[var(--color-fg)] text-sm font-medium">
              Preview · {validRows.length} valid · {invalidRows.length} skipped
            </p>
            <button
              type="button"
              onClick={onImport}
              disabled={pending || validRows.length === 0}
              className={cn(
                "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)] inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-xs font-semibold",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              {pending
                ? "Importing…"
                : `Import ${validRows.length} ${validRows.length === 1 ? "row" : "rows"}`}
            </button>
          </div>

          <div className="border-[var(--color-border)] max-h-96 overflow-auto rounded-lg border bg-[var(--color-bg-elevated)]">
            <table className="w-full text-xs">
              <thead className="border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 border-b">
                <tr className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-widest">
                  <th className="p-2 text-left">Row</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Slug</th>
                  <th className="p-2 text-left">SKU</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-[var(--color-border)] divide-y">
                {parsed.slice(0, 50).map((p) => (
                  <tr
                    key={p.rowNumber}
                    className={cn(
                      p.error
                        ? "bg-[var(--color-danger)]/5"
                        : "hover:bg-[var(--color-accent-soft)]/40",
                    )}
                  >
                    <td className="text-[var(--color-fg-subtle)] p-2 font-mono">
                      {p.rowNumber}
                    </td>
                    <td className="p-2">
                      {p.payload?.name ?? p.raw.name ?? "—"}
                      {p.error && (
                        <p className="text-[var(--color-danger)] mt-0.5 text-[11px]">
                          ✗ {p.error}
                        </p>
                      )}
                    </td>
                    <td className="text-[var(--color-fg-muted)] p-2 font-mono">
                      {p.payload?.slug ?? "—"}
                    </td>
                    <td className="text-[var(--color-fg-muted)] p-2 font-mono">
                      {p.payload?.sku ?? "—"}
                    </td>
                    <td className="text-[var(--color-fg-muted)] p-2">
                      {p.raw.category ?? "—"}
                    </td>
                    <td className="text-[var(--color-fg-muted)] p-2">
                      {p.payload?.status ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 50 && (
              <p className="text-[var(--color-fg-subtle)] border-[var(--color-border)] border-t p-2 text-center text-[11px]">
                Showing first 50 of {parsed.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {importResult && (
        <div
          role="status"
          className={cn(
            "rounded-md border p-3 text-xs",
            importResult.errors.length > 0
              ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
              : "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]",
          )}
        >
          ✓ Imported {importResult.created}{" "}
          {importResult.created === 1 ? "product" : "products"}.{" "}
          {importResult.errors.length > 0 && (
            <>
              Skipped {importResult.skipped}:
              <ul className="mt-2 list-inside list-disc">
                {importResult.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
                {importResult.errors.length > 10 && (
                  <li>… and {importResult.errors.length - 10} more</li>
                )}
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
    </div>
  );
}
