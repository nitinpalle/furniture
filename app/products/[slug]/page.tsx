import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { InquiryCard } from "@/components/product/InquiryCard";
import { SpecsList } from "@/components/product/SpecsList";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { StickyMobileCTA } from "@/components/product/StickyMobileCTA";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} — ${product.dimensions ?? "Dining table"}. Enquire on WhatsApp for trade pricing.`,
    openGraph: {
      title: product.name,
      description: product.description ?? brand.tagline,
      images: product.image_urls?.[0] ? [product.image_urls[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(
    {
      id: product.id,
      name: product.name,
      capacity: product.capacity,
      category_id: product.category_id,
    },
    4,
  );

  const productForEnquiry = {
    slug: product.slug,
    name: product.name,
    sku: product.sku ?? null,
    dimensions: product.dimensions ?? null,
    series: product.series?.name ?? null,
  };

  return (
    <>
      {/* Breadcrumbs */}
      <nav
        className="mx-auto max-w-7xl px-4 py-4 text-xs lg:px-8"
        aria-label="Breadcrumb"
      >
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
          {product.category && (
            <>
              <ChevronRight
                className="text-[var(--color-fg-subtle)] h-3 w-3"
                aria-hidden
              />
              <li>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-[var(--color-fg)] transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          {product.subcategory && (
            <>
              <ChevronRight
                className="text-[var(--color-fg-subtle)] h-3 w-3"
                aria-hidden
              />
              <li className="text-[var(--color-fg)] font-medium">
                {product.subcategory.name}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Two-panel layout */}
      <div className="mx-auto max-w-7xl px-4 pb-24 lg:pb-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left: gallery (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={product.image_urls ?? []}
              alt={product.name}
            />
          </div>

          {/* Right: scrollable content */}
          <div className="mt-8 space-y-10 lg:mt-0">
            {/* Title block */}
            <header className="space-y-2">
              {product.subcategory && (
                <p className="text-[var(--color-fg-subtle)] text-xs font-mono uppercase tracking-widest">
                  {product.subcategory.name}
                </p>
              )}
              <h1 className="font-[var(--font-display)] text-balance text-3xl font-medium tracking-tight md:text-4xl">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-[var(--color-fg-muted)] font-mono text-sm">
                  SKU {product.sku}
                </p>
              )}
            </header>

            {/* Inquiry card (replaces price/cart panel) */}
            <InquiryCard
              productId={product.id}
              product={productForEnquiry}
              countryOfOrigin={product.country_of_origin}
              moq={product.moq}
              leadTimeDays={product.lead_time_days}
            />

            {/* Description */}
            <section className="space-y-3">
              <h2 className="text-[var(--color-fg)] text-base font-semibold">
                Description
              </h2>
              {product.description ? (
                <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">
                  {product.description}
                </p>
              ) : (
                <div className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] rounded-lg border p-4">
                  <p className="text-[var(--color-fg-muted)] text-sm">
                    Product description coming soon. For full specs, finishes,
                    and trade pricing,{" "}
                    <span className="text-[var(--color-fg)] font-medium">
                      enquire on WhatsApp
                    </span>{" "}
                    using the button above.
                  </p>
                </div>
              )}
            </section>

            {/* Key attributes */}
            <SpecsList
              specs={{
                sku: product.sku,
                dimensions: product.dimensions,
                capacity: product.capacity,
                material: product.material,
                color: product.color,
                countryOfOrigin: product.country_of_origin,
                moq: product.moq,
                leadTimeDays: product.lead_time_days,
                series: product.series?.name ?? null,
              }}
            />

            {/* Similar products carousel */}
            {similar.length > 0 && (
              <SimilarProducts products={similar} heading="Similar products" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <StickyMobileCTA productId={product.id} product={productForEnquiry} />
    </>
  );
}
