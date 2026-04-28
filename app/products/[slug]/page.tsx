import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      eyebrow={`Product · ${slug}`}
      title="Product detail page lands in Phase 4."
      description="The PDP design is paused for your input — sticky WhatsApp CTA, image gallery, full specs, and related products will all live here."
      comingIn="Phase 4"
    />
  );
}
