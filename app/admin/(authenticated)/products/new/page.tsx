import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const [categoriesRes, suppliersRes, seriesRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("display_order", { ascending: true }),
    supabase.from("suppliers").select("id, name, country").order("name"),
    supabase.from("series").select("id, name, slug").order("display_order"),
  ]);

  const allCategories = categoriesRes.data ?? [];
  const topCategories = allCategories.filter((c) => !c.parent_id);
  const subcategories = allCategories.filter((c) => c.parent_id);
  const suppliers = suppliersRes.data ?? [];
  const series = seriesRes.data ?? [];

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
            New product
          </p>
          <h1 className="font-[var(--font-display)] mt-1 text-3xl font-medium tracking-tight">
            Add a product
          </h1>
          <p className="text-[var(--color-fg-muted)] mt-1 text-sm">
            Manual entry. After saving, you&rsquo;ll land on the edit page where
            you can upload images.
          </p>
        </header>
      </div>

      <ProductForm
        topCategories={topCategories}
        subcategories={subcategories}
        suppliers={suppliers}
        series={series}
      />
    </div>
  );
}
