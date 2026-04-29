import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSeriesBySlug, listProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  return { title: series?.name ?? slug };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const result = await listProducts({
    seriesSlug: slug,
    sort: "featured",
    perPage: 60,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 lg:px-8">
      <nav className="mb-4 text-xs" aria-label="Breadcrumb">
        <ol className="text-[var(--color-fg-muted)] flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="text-[var(--color-fg-subtle)] h-3 w-3" aria-hidden />
          <li>
            <span className="text-[var(--color-fg-subtle)]">Collection</span>
          </li>
          <ChevronRight className="text-[var(--color-fg-subtle)] h-3 w-3" aria-hidden />
          <li className="text-[var(--color-fg)] font-medium">{series.name}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
          Collection
        </p>
        <h1 className="font-[var(--font-display)] mt-2 text-3xl font-medium tracking-tight md:text-5xl">
          {series.name}
        </h1>
        {series.description && (
          <p className="text-[var(--color-fg-muted)] mt-3 max-w-2xl text-sm leading-relaxed">
            {series.description}
          </p>
        )}
      </header>

      <ProductGrid products={result.products} source="card" />
    </div>
  );
}
