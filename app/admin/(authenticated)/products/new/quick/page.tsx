import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuickAddTable } from "@/components/admin/QuickAddTable";

export const metadata = { title: "Quick add — multiple products" };

export default async function QuickAddPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("display_order", { ascending: true });

  const all = categories ?? [];
  const topCategories = all
    .filter((c) => !c.parent_id)
    .map((c) => ({ id: c.id, name: c.name }));
  const subcategories = all.filter((c) => c.parent_id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
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
            Multiple products
          </p>
          <h1 className="font-[var(--font-display)] mt-1 text-3xl font-medium tracking-tight">
            Quick-add a batch
          </h1>
          <p className="text-[var(--color-fg-muted)] mt-1 max-w-2xl text-sm">
            Fast multi-row entry with the basics — name, SKU, category,
            dimensions. Other fields (description, material, images, supplier)
            are added per-product on the edit page after creation.
          </p>
        </header>
      </div>

      <QuickAddTable
        topCategories={topCategories}
        subcategories={subcategories}
      />
    </div>
  );
}
