import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      eyebrow={`Category · ${slug}`}
      title="Category page lands in Phase 3."
      description="Pre-filtered grid of products in this category, with sub-category chips at the top and filter sidebar."
      comingIn="Phase 3"
    />
  );
}
