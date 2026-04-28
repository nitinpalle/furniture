/**
 * Server-only product fetchers.
 * Used by the PDP, listing, category, series, and home pages.
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product, Series } from "@/lib/database.types";

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

export type ListProductsArgs = {
  search?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  seriesSlug?: string;
  capacities?: string[];
  countries?: string[];
  projectType?: string;
  sort?: "featured" | "newest" | "name-asc";
  page?: number;
  perPage?: number;
};

export type ListProductsResult = {
  products: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

// ============================================================
// SINGLE-PRODUCT FETCH
// ============================================================

/**
 * Fetch a single published product by slug (with category + series joins).
 * Cached per-request via React 19 server cache.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
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
  },
);

// ============================================================
// LISTING (the workhorse)
// ============================================================

const PRODUCT_CARD_COLS =
  "id,slug,name,sku,image_urls,country_of_origin,dimensions,capacity,is_featured,created_at";

/**
 * Paginated, filterable, searchable listing of published products.
 * Drives /products, /categories/[slug], /collections/[slug], home featured.
 */
export async function listProducts(
  args: ListProductsArgs = {},
): Promise<ListProductsResult> {
  const supabase = await createClient();
  const page = Math.max(1, args.page ?? 1);
  const perPage = Math.min(60, Math.max(1, args.perPage ?? 24));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let q = supabase
    .from("products")
    .select(PRODUCT_CARD_COLS, { count: "exact" })
    .eq("status", "published")
    .is("deleted_at", null);

  // ----- search (server-side full-text via or() across name + sku + description) -----
  if (args.search?.trim()) {
    const term = args.search.trim().replace(/[%_]/g, "");
    q = q.or(
      `name.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`,
    );
  }

  // ----- category / sub-category resolved by slug → id (one extra fetch) -----
  if (args.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", args.categorySlug)
      .is("parent_id", null)
      .maybeSingle();
    if (cat) q = q.eq("category_id", cat.id);
  }
  if (args.subcategorySlug) {
    const { data: sub } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", args.subcategorySlug)
      .not("parent_id", "is", null)
      .maybeSingle();
    if (sub) q = q.eq("subcategory_id", sub.id);
  }
  if (args.seriesSlug) {
    const { data: ser } = await supabase
      .from("series")
      .select("id")
      .eq("slug", args.seriesSlug)
      .maybeSingle();
    if (ser) q = q.eq("series_id", ser.id);
  }

  // ----- multi-value filters -----
  if (args.capacities?.length) q = q.in("capacity", args.capacities);
  if (args.countries?.length) q = q.in("country_of_origin", args.countries);
  if (args.projectType) q = q.contains("project_types", [args.projectType]);

  // ----- sort -----
  switch (args.sort ?? "featured") {
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    case "name-asc":
      q = q.order("name", { ascending: true });
      break;
    case "featured":
    default:
      q = q.order("is_featured", { ascending: false }).order("created_at", {
        ascending: false,
      });
      break;
  }

  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) {
    console.error("listProducts failed:", error.message);
    return { products: [], total: 0, page, perPage, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    products: (data ?? []) as ProductCardData[],
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// ============================================================
// FEATURED (home page) — convenience wrapper
// ============================================================

export async function getFeaturedProducts(
  limit = 8,
): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_COLS)
    .eq("status", "published")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts failed:", error.message);
    return [];
  }
  return (data ?? []) as ProductCardData[];
}

// ============================================================
// SIMILAR — used on PDP
// ============================================================

export async function getSimilarProducts(
  current: Pick<Product, "id" | "name" | "capacity" | "category_id">,
  limit = 4,
): Promise<ProductCardData[]> {
  const supabase = await createClient();

  let q = supabase
    .from("products")
    .select(PRODUCT_CARD_COLS)
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
  const scored = (siblings as ProductCardData[]).map((s) => {
    let score = 0;
    if (currentShape && extractShape(s.name) === currentShape) score += 3;
    if (current.capacity && s.capacity === current.capacity) score += 1;
    return { product: s, score };
  });
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  return scored.slice(0, limit).map((x) => x.product);
}

// ============================================================
// CATEGORIES & SERIES
// ============================================================

export const getCategoryBySlug = cache(
  async (
    slug: string,
  ): Promise<
    | (Category & { subcategories: { name: string; slug: string }[] })
    | null
  > => {
    const supabase = await createClient();
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .is("parent_id", null)
      .maybeSingle();
    if (!cat) return null;
    const { data: subs } = await supabase
      .from("categories")
      .select("name,slug")
      .eq("parent_id", cat.id)
      .order("display_order", { ascending: true });
    return { ...cat, subcategories: subs ?? [] };
  },
);

export const getSubcategoryBySlugs = cache(
  async (parentSlug: string, subSlug: string): Promise<Category | null> => {
    const supabase = await createClient();
    const { data: parent } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", parentSlug)
      .is("parent_id", null)
      .maybeSingle();
    if (!parent) return null;
    const { data: sub } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", subSlug)
      .eq("parent_id", parent.id)
      .maybeSingle();
    return sub;
  },
);

export const getSeriesBySlug = cache(
  async (slug: string): Promise<Series | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("series")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data;
  },
);

// ============================================================
// COVER IMAGES FOR CATEGORY TILES (home page)
// ============================================================

/**
 * For each top-level category, return name + slug + product count + a cover
 * image taken from one of its products. Used for the home page category tiles.
 */
export async function getCategoryTiles(): Promise<
  { name: string; slug: string; count: number; cover: string | null }[]
> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,display_order")
    .is("parent_id", null)
    .order("display_order", { ascending: true });

  if (!categories) return [];

  const out: {
    name: string;
    slug: string;
    count: number;
    cover: string | null;
  }[] = [];

  for (const cat of categories) {
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .eq("category_id", cat.id)
      .is("deleted_at", null);

    const { data: cover } = await supabase
      .from("products")
      .select("image_urls")
      .eq("status", "published")
      .eq("category_id", cat.id)
      .is("deleted_at", null)
      .order("is_featured", { ascending: false })
      .limit(1)
      .maybeSingle();

    out.push({
      name: cat.name,
      slug: cat.slug,
      count: count ?? 0,
      cover: cover?.image_urls?.[0] ?? null,
    });
  }
  return out;
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
