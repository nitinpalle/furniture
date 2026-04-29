import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { InquiryCard } from "@/components/product/InquiryCard";
import { SpecsList } from "@/components/product/SpecsList";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { StickyMobileBar } from "@/components/product/StickyMobileBar";
import { ExpandableSection } from "@/components/product/ExpandableSection";
import { QuickActions } from "@/components/product/QuickActions";
import { MobileGalleryOverlay } from "@/components/product/MobileGalleryOverlay";
import { MobileCurveCard } from "@/components/product/MobileCurveCard";

type Params = Promise<{ slug: string }>;

const PROJECT_LABELS: Record<string, string> = {
  hospitality: "Hospitality",
  residential: "Residential",
  office: "Office",
  restaurant: "Restaurant",
};

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
    8,
  );

  const productForEnquiry = {
    slug: product.slug,
    name: product.name,
    sku: product.sku ?? null,
    dimensions: product.dimensions ?? null,
    series: product.series?.name ?? null,
  };

  const flag = flagFor(product.country_of_origin);
  const summaryBits = [
    product.dimensions,
    product.country_of_origin
      ? `${flag ? flag + " " : ""}Made in ${product.country_of_origin}`
      : null,
  ].filter(Boolean) as string[];

  const leadTimeStr =
    product.lead_time_days != null
      ? `${product.lead_time_days}–${product.lead_time_days + 15} days`
      : null;

  return (
    <>
      {/* ============== Breadcrumbs (desktop only) ============== */}
      <nav
        className="mx-auto hidden max-w-7xl px-4 pt-3 text-xs lg:block lg:px-8"
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

      {/* ============== DESKTOP TITLE (above gallery) ============== */}
      <header className="mx-auto hidden max-w-7xl px-4 lg:block lg:px-8 lg:pt-5">
        <h1 className="font-[var(--font-display)] text-balance text-3xl font-medium tracking-tight lg:text-4xl">
          {product.name}
        </h1>
        {summaryBits.length > 0 && (
          <p className="text-[var(--color-fg-muted)] mt-1 text-sm">
            {summaryBits.join(" · ")}
          </p>
        )}
      </header>

      {/* ============== GALLERY (both viewports) ============== */}
      <section className="relative mx-auto w-full max-w-7xl lg:mt-5 lg:px-8">
        <ProductGallery
          images={product.image_urls ?? []}
          alt={product.name}
        />
        {/* Back + search buttons overlaid on the gallery (mobile only). */}
        <MobileGalleryOverlay />
      </section>

      {/*
        Mobile curve card — wraps everything below the gallery so it can
        slide up over the gallery's bottom edge with rounded top corners.
        Desktop: passthrough (no scoop).
      */}
      <MobileCurveCard>
        {/* ============== MOBILE TITLE (inside the curve card) ============== */}
        <header className="mx-auto max-w-7xl px-5 pt-2 lg:hidden">
          {product.series?.name && (
            <p className="text-[var(--color-fg-subtle)] mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
              {product.series.name}
            </p>
          )}
          <h1 className="font-[var(--font-display)] text-balance text-[28px] font-medium leading-[1.1] tracking-tight">
            {product.name}
          </h1>
          {summaryBits.length > 0 && (
            <p className="text-[var(--color-fg-muted)] mt-2 text-sm leading-relaxed">
              {summaryBits.join(" · ")}
            </p>
          )}
        </header>

        {/* ============== MOBILE: origin + lead time row ============== */}
        {(product.country_of_origin || leadTimeStr) && (
          <section className="mx-auto mt-4 max-w-7xl px-5 lg:hidden">
            <div className="text-[var(--color-fg-muted)] flex items-center gap-2 text-xs">
              {flag && <span aria-hidden>{flag}</span>}
              {product.country_of_origin && (
                <span>Made in {product.country_of_origin}</span>
              )}
              {leadTimeStr && (
                <>
                  <span className="text-[var(--color-fg-subtle)]" aria-hidden>·</span>
                  <span className="font-mono text-[11px] uppercase tracking-wide">
                    Lead {leadTimeStr}
                  </span>
                </>
              )}
            </div>
          </section>
        )}

      {/* ============== TWO-COLUMN: details (60%) + sticky inquiry card (40%) ============== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-12 xl:gap-16">
          {/* LEFT — description, project chips, specs, expandable sections */}
          <div className="space-y-8 lg:space-y-10">
            {/* Description */}
            <section className="space-y-3">
              <h2 className="text-[var(--color-fg-subtle)] text-[11px] font-semibold uppercase tracking-widest lg:text-base lg:tracking-normal lg:text-[var(--color-fg)] lg:normal-case">
                Description
              </h2>
              {product.description ? (
                <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed lg:text-base">
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
                    using the panel{" "}
                    <span className="hidden lg:inline">on the right</span>
                    <span className="lg:hidden">at the bottom</span>.
                  </p>
                </div>
              )}
            </section>

            {/* Designed for / project chips */}
            {product.project_types && product.project_types.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[var(--color-fg-subtle)] text-[11px] font-semibold uppercase tracking-widest lg:text-base lg:tracking-normal lg:text-[var(--color-fg)] lg:normal-case">
                  Designed for
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.project_types.map((pt) => (
                    <Link
                      key={pt}
                      href={`/products?project=${pt}`}
                      className="border-[var(--color-border-strong)] hover:border-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)] inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium transition-colors"
                    >
                      {PROJECT_LABELS[pt] ?? pt}
                    </Link>
                  ))}
                </div>
              </section>
            )}

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

            {/* Expandable sections */}
            <section>
              <ExpandableSection title="Materials & care">
                <p>
                  {product.material
                    ? `${product.material}.`
                    : "Material details on request."}{" "}
                  Wipe with a soft damp cloth; avoid abrasive cleaners. For
                  detailed care instructions and certifications, enquire on
                  WhatsApp.
                </p>
              </ExpandableSection>
              <ExpandableSection title="Trade pricing & terms">
                <p>
                  Trade pricing on request. Volume discounts available at
                  scale. Net terms negotiable for verified accounts. WhatsApp
                  us with project scope and SKU for a tailored quote.
                </p>
              </ExpandableSection>
              <ExpandableSection title="Shipping & lead time">
                <p>
                  {product.country_of_origin
                    ? `Ships from ${product.country_of_origin}.`
                    : "Sourced internationally."}{" "}
                  Standard lead time{" "}
                  <span className="font-medium">
                    {leadTimeStr ?? "on request"}
                  </span>
                  . Custom timelines and white-glove delivery available — share
                  your timeline on WhatsApp.
                </p>
              </ExpandableSection>
            </section>

            {/* Mobile-only: Share + Copy link, just below the accordions */}
            <div className="lg:hidden">
              <QuickActions productName={product.name} />
            </div>
          </div>

          {/* RIGHT — sticky inquiry card. Desktop only. */}
          <aside className="hidden lg:mt-0 lg:block">
            <div className="lg:sticky lg:top-24">
              <InquiryCard
                productId={product.id}
                product={productForEnquiry}
                countryOfOrigin={product.country_of_origin}
                moq={product.moq}
                leadTimeDays={product.lead_time_days}
              />
            </div>
          </aside>
        </div>
      </section>
      </MobileCurveCard>

      {/* ============== FULL-WIDTH SIMILAR PRODUCTS ============== */}
      {similar.length > 0 && (
        <section
          className={cn(
            "border-[var(--color-border)] border-y bg-[var(--color-bg-elevated)]",
            "py-14 lg:py-20",
          )}
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SimilarProducts products={similar} heading="Similar products" />
          </div>
        </section>
      )}

      {/* Mobile sticky bottom bar — appears after 10% scroll */}
      <StickyMobileBar
        productId={product.id}
        product={productForEnquiry}
        moq={product.moq}
        leadTimeDays={product.lead_time_days}
      />
    </>
  );
}
