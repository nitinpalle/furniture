import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

type Params = Promise<{ slug: string; subSlug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, subSlug } = await params;
  return { title: `${subSlug} · ${slug}` };
}

export default async function SubCategoryPage({ params }: { params: Params }) {
  const { slug, subSlug } = await params;
  return (
    <PlaceholderPage
      eyebrow={`${slug} / ${subSlug}`}
      title="Sub-category page lands in Phase 3."
      description="Same grid as the catalog, pre-filtered by both category and sub-category."
      comingIn="Phase 3"
    />
  );
}
