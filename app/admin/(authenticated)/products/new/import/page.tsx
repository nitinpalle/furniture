import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CsvImport } from "@/components/admin/CsvImport";

export const metadata = { title: "Import products from CSV" };

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, parent_id");

  const all = categories ?? [];
  const slugToId: Record<string, string> = {};
  const idToSlug: Record<string, string> = {};
  for (const c of all) {
    if (!c.parent_id) {
      slugToId[c.slug] = c.id;
      idToSlug[c.id] = c.slug;
    }
  }
  const subcategoriesBySlug: Record<
    string,
    { id: string; parentSlug: string | null }
  > = {};
  for (const c of all) {
    if (c.parent_id) {
      subcategoriesBySlug[c.slug] = {
        id: c.id,
        parentSlug: idToSlug[c.parent_id] ?? null,
      };
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] inline-flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          All products
        </Link>
        <header className="mt-3">
          <p className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-[0.2em]">
            Bulk import
          </p>
          <h1 className="font-[var(--font-display)] mt-1 text-3xl font-medium tracking-tight">
            Import from CSV
          </h1>
          <p className="text-[var(--color-fg-muted)] mt-1 max-w-2xl text-sm">
            Bulk-create products from a CSV. Each row becomes a draft (or
            published) product. Images and rich descriptions are added
            per-product on the edit page after import.
          </p>
        </header>
      </div>

      <CsvImport
        categoriesBySlug={slugToId}
        subcategoriesBySlug={subcategoriesBySlug}
      />
    </div>
  );
}
