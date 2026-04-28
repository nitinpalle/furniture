import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getCategoryBySlug,
  getSubcategoryBySlugs,
  listProducts,
} from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ListingHeader } from "@/components/product/ListingHeader";
import { Pagination } from "@/components/product/Pagination";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { MobileFilterSheet } from "@/components/filters/MobileFilterSheet";

type Params = Promise<{ slug: string; subSlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTER_CAPACITIES = ["Seats 4", "Seats 6", "Seats 4–6", "Seats 6–8", "Seats 8", "Seats 8–10"];
const FILTER_COUNTRIES = ["China", "India", "Italy", "Vietnam"];

function getString(p: Record<string, string | string[] | undefined>, key: string) {
  const v = p[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, subSlug } = await params;
  const sub = await getSubcategoryBySlugs(slug, subSlug);
  return { title: sub?.name ?? subSlug };
}

export default async function SubCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug, subSlug } = await params;
  const sp = await searchParams;
  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(slug),
    getSubcategoryBySlugs(slug, subSlug),
  ]);
  if (!category || !subcategory) notFound();

  const page = parseInt(getString(sp, "page") ?? "1", 10);
  const search = getString(sp, "q");
  const sort = getString(sp, "sort") as
    | "featured"
    | "newest"
    | "name-asc"
    | undefined;
  const capacity = getString(sp, "capacity");
  const country = getString(sp, "country");
  const project = getString(sp, "project");

  const basePath = `/categories/${slug}/${subSlug}`;

  const result = await listProducts({
    categorySlug: slug,
    subcategorySlug: subSlug,
    search,
    sort,
    page,
    perPage: 24,
    capacities: capacity ? capacity.split(",").filter(Boolean) : undefined,
    countries: country ? country.split(",").filter(Boolean) : undefined,
    projectType: project,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs" aria-label="Breadcrumb">
        <ol className="text-[var(--color-fg-muted)] flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="text-[var(--color-fg-subtle)] h-3 w-3" aria-hidden />
          <li>
            <Link
              href="/products"
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              Catalog
            </Link>
          </li>
          <ChevronRight className="text-[var(--color-fg-subtle)] h-3 w-3" aria-hidden />
          <li>
            <Link
              href={`/categories/${slug}`}
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              {category.name}
            </Link>
          </li>
          <ChevronRight className="text-[var(--color-fg-subtle)] h-3 w-3" aria-hidden />
          <li className="text-[var(--color-fg)] font-medium">{subcategory.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
          {category.name}
        </p>
        <h1 className="font-[var(--font-display)] mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {subcategory.name}
        </h1>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <FilterPanel
              capacities={FILTER_CAPACITIES}
              countries={FILTER_COUNTRIES}
              basePath={basePath}
            />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="lg:hidden">
            <MobileFilterSheet
              capacities={FILTER_CAPACITIES}
              countries={FILTER_COUNTRIES}
              basePath={basePath}
            />
          </div>

          <ListingHeader total={result.total} basePath={basePath} />

          <ProductGrid products={result.products} source="card" />

          <div className="pt-6">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp}
              basePath={basePath}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
