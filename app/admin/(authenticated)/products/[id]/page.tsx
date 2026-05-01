import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

type Params = Promise<{ id: string }>;

export default async function AdminEditProduct({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [productRes, categoriesRes, suppliersRes, seriesRes] = await Promise.all(
    [
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("display_order", { ascending: true }),
      supabase.from("suppliers").select("id, name, country").order("name"),
      supabase.from("series").select("id, name, slug").order("display_order"),
    ],
  );

  if (!productRes.data) notFound();

  const product = productRes.data;
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
            Edit product
          </p>
          <h1 className="font-[var(--font-display)] mt-1 text-balance text-2xl font-medium tracking-tight md:text-3xl">
            {product.name}
          </h1>
          <p className="text-[var(--color-fg-subtle)] mt-1 font-mono text-xs">
            {product.id}
          </p>
        </header>
      </div>

      <ProductForm
        product={product}
        topCategories={topCategories}
        subcategories={subcategories}
        suppliers={suppliers}
        series={series}
      />
    </div>
  );
}
