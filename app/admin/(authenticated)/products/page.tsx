import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getString(p: Record<string, string | string[] | undefined>, k: string) {
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
}

const PER_PAGE = 30;

async function fetchProducts({
  q,
  status,
  page,
}: {
  q?: string;
  status?: string;
  page: number;
}) {
  const supabase = await createClient();
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select(
      "id, slug, name, sku, status, is_featured, image_urls, dimensions, capacity, country_of_origin, updated_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (q) {
    const term = q.replace(/[%_]/g, "");
    query = query.or(
      `name.ilike.%${term}%,sku.ilike.%${term}%,slug.ilike.%${term}%`,
    );
  }
  if (status === "draft" || status === "published") {
    query = query.eq("status", status);
  }
  if (status === "featured") {
    query = query.eq("is_featured", true);
  }

  query = query.order("updated_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("admin products fetch failed:", error.message);
  }
  return { products: data ?? [], total: count ?? 0 };
}

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = getString(sp, "q") ?? "";
  const status = getString(sp, "status") ?? "all";
  const page = Math.max(1, parseInt(getString(sp, "page") ?? "1", 10));
  const { products, total } = await fetchProducts({ q, status, page });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-[0.2em]">
            Catalog
          </p>
          <h1 className="font-[var(--font-display)] mt-1 text-3xl font-medium tracking-tight">
            Products
          </h1>
          <p className="text-[var(--color-fg-muted)] mt-1 text-sm">
            {total} {total === 1 ? "product" : "products"}
            {q && ` matching "${q}"`}
          </p>
        </div>
      </header>

      {/* Filters */}
      <form
        method="GET"
        className="border-[var(--color-border)] mb-6 flex flex-wrap items-center gap-2 rounded-lg border bg-[var(--color-bg-elevated)] p-3"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, SKU, or slug…"
          className="flex-1 rounded-md border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-fg)] focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="featured">Featured</option>
        </select>
        <button
          type="submit"
          className="bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)] inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
        >
          Apply
        </button>
        {(q || status !== "all") && (
          <Link
            href="/admin/products"
            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-xs"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="border-[var(--color-border)] overflow-hidden rounded-lg border bg-[var(--color-bg-elevated)]">
        <table className="w-full text-sm">
          <thead className="border-[var(--color-border)] bg-[var(--color-bg)] border-b">
            <tr className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-widest">
              <th className="hidden p-3 text-left sm:table-cell">Image</th>
              <th className="p-3 text-left">Product</th>
              <th className="hidden p-3 text-left md:table-cell">SKU</th>
              <th className="hidden p-3 text-left lg:table-cell">Dimensions</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-[var(--color-border)] divide-y">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-[var(--color-fg-muted)] p-8 text-center text-sm"
                >
                  No products match.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--color-accent-soft)]/40">
                  <td className="hidden p-3 sm:table-cell">
                    <div className="bg-[var(--color-accent-soft)] relative h-12 w-12 overflow-hidden rounded-md">
                      {p.image_urls?.[0] && (
                        <Image
                          src={p.image_urls[0]}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[var(--color-fg)] hover:text-[var(--color-accent)] flex items-center gap-1.5 font-medium transition-colors"
                    >
                      {p.is_featured && (
                        <Star
                          className="text-[var(--color-warning)] h-3 w-3 shrink-0 fill-current"
                          aria-label="Featured"
                        />
                      )}
                      {p.name}
                    </Link>
                    <p className="text-[var(--color-fg-subtle)] mt-0.5 text-[11px] sm:hidden">
                      SKU {p.sku ?? "—"}
                    </p>
                  </td>
                  <td className="text-[var(--color-fg-muted)] hidden p-3 font-mono text-xs md:table-cell">
                    {p.sku ?? "—"}
                  </td>
                  <td className="text-[var(--color-fg-muted)] hidden p-3 font-mono text-xs lg:table-cell">
                    {p.dimensions ?? "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                        p.status === "published"
                          ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                          : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-xs"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="text-[var(--color-fg-muted)] mt-6 flex items-center justify-center gap-3 text-xs"
          aria-label="Pagination"
        >
          <Link
            href={pagedUrl({ q, status, page: Math.max(1, page - 1) })}
            className={cn(
              "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-8 items-center rounded-md border px-3",
              page === 1 && "pointer-events-none opacity-40",
            )}
          >
            ← Prev
          </Link>
          <span className="font-mono">
            Page {page} of {totalPages}
          </span>
          <Link
            href={pagedUrl({ q, status, page: Math.min(totalPages, page + 1) })}
            className={cn(
              "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-8 items-center rounded-md border px-3",
              page === totalPages && "pointer-events-none opacity-40",
            )}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}

function pagedUrl({ q, status, page }: { q?: string; status?: string; page: number }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}
