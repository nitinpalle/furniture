import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      eyebrow={`Collection · ${slug}`}
      title="Collection page lands in Phase 3."
      description="Series spotlight with hero image, story, and the products in this collection."
      comingIn="Phase 3"
    />
  );
}
