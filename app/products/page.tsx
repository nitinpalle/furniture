import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata = { title: "Catalog" };

export default function ProductsPage() {
  return (
    <PlaceholderPage
      eyebrow="Catalog"
      title="The catalog lands in Phase 3."
      description="Filterable grid by category, sub-category, series, material, country of origin, lead time. Search by name, SKU, or description. 4 columns on desktop, 2 on mobile."
      comingIn="Phase 3"
    />
  );
}
