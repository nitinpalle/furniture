/**
 * Server-only product fetchers.
 * Used by the PDP, listing, and home page.
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/database.types";

// ============================================================
// TYPES
// ============================================================

export type ProductDetail = Product & {
  category: { name: string; slug: string } | null;
  subcategory: { name: string; slug: string } | null;
  series: { name: string; slug: string } | null;
};

export type ProductCardData = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "sku"
  | "image_urls"
  | "country_of_origin"
  | "dimensions"
  | "capacity"
>;

// ============================================================
// FETCHERS
// ============================================================

/**
 * Fetch a single published product by slug (with category + series joins).
 * Cached per-request via React 19 server cache.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!products_category_id_fkey(name,slug),
      subcategory:categories!products_subcategory_id_fkey(name,slug),
      series:series(name,slug)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug failed:", error.message);
    return null;
  }
  return data as ProductDetail | null;
});

/**
 * Find similar products. Cascade:
 *   1. Same shape (extracted from name: "Round" / "Long" / "Rectangular")
 *   2. Same capacity (Seats 4 / 6 / 8 / etc.)
 *   3. Random dining tables
 * Always returns up to `limit` items (default 4), excluding the current product.
 */
export async function getSimilarProducts(
  current: Pick<Product, "id" | "name" | "capacity" | "category_id">,
  limit = 4,
): Promise<ProductCardData[]> {
  const supabase = await createClient();

  // Fetch siblings in the same category (or all if no category)
  let q = supabase
    .from("products")
    .select(
      "id,slug,name,sku,image_urls,country_of_origin,dimensions,capacity",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .neq("id", current.id);
  if (current.category_id) q = q.eq("category_id", current.category_id);
  const { data: siblings, error } = await q.limit(50);
  if (error || !siblings) {
    console.error("getSimilarProducts failed:", error?.message);
    return [];
  }

  const currentShape = extractShape(current.name);

  // Score each sibling
  const scored = siblings.map((s) => {
    let score = 0;
    if (currentShape && extractShape(s.name) === currentShape) score += 3;
    if (current.capacity && s.capacity === current.capacity) score += 1;
    return { product: s, score };
  });

  // Sort by score desc, with random tiebreaker; take top N
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  return scored.slice(0, limit).map((x) => x.product);
}

// ============================================================
// HELPERS
// ============================================================

function extractShape(name: string): "Round" | "Long" | "Rectangular" | null {
  if (/Round/i.test(name)) return "Round";
  if (/Long/i.test(name)) return "Long";
  if (/Rectangular/i.test(name)) return "Rectangular";
  return null;
}
