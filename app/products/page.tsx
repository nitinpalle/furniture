import { listProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ListingHeader } from "@/components/product/ListingHeader";
import { Pagination } from "@/components/product/Pagination";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { MobileFilterSheet } from "@/components/filters/MobileFilterSheet";

export const metadata = { title: "Catalog" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTER_CAPACITIES = ["Seats 4", "Seats 6", "Seats 4–6", "Seats 6–8", "Seats 8", "Seats 8–10"];
const FILTER_COUNTRIES = ["China", "India", "Italy", "Vietnam"];

function getString(p: Record<string, string | string[] | undefined>, key: string) {
  const v = p[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = parseInt(getString(sp, "page") ?? "1", 10);
  const search = getString(sp, "q");
  const sort = getString(sp, "sort") as "featured" | "newest" | "name-asc" | undefined;
  const capacity = getString(sp, "capacity");
  const country = getString(sp, "country");
  const project = getString(sp, "project");

  const result = await listProducts({
    search,
    sort,
    page,
    perPage: 24,
    capacities: capacity ? capacity.split(",").filter(Boolean) : undefined,
    countries: country ? country.split(",").filter(Boolean) : undefined,
    projectType: project,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 lg:px-8 lg:pt-12">
      <header className="mb-10 lg:mb-14 iv">
        <p className="eyebrow eyebrow-rule">Catalog</p>
        <h1 className="display-1 mt-4 font-medium">All products.</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-fg-muted)] leading-relaxed">
          <span className="text-[var(--color-fg)] font-medium">
            {result.total}
          </span>{" "}
          products curated for designers, architects, and contract buyers.
          Click any item to enquire on WhatsApp.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <FilterPanel
              capacities={FILTER_CAPACITIES}
              countries={FILTER_COUNTRIES}
              basePath="/products"
            />
          </div>
        </aside>

        <div className="space-y-6">
          {/* Mobile filter trigger */}
          <div className="lg:hidden">
            <MobileFilterSheet
              capacities={FILTER_CAPACITIES}
              countries={FILTER_COUNTRIES}
              basePath="/products"
            />
          </div>

          <ListingHeader total={result.total} basePath="/products" />

          <ProductGrid products={result.products} source="card" />

          <div className="pt-6">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp}
              basePath="/products"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
