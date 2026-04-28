/**
 * Navigation data — categories fetched from DB, project types static.
 *
 * Used by the navbar dropdowns and the mobile drawer.
 */

import { createClient } from "@/lib/supabase/server";

export type NavCategory = {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
};

export type NavProjectType = {
  name: string;
  slug: string;
  description: string;
};

// Project types are not stored in the DB — they're a fixed taxonomy that
// products opt into via the `products.project_types` array. This list is
// the single source of truth for nav, filter chips, and home-page tiles.
export const PROJECT_TYPES: NavProjectType[] = [
  {
    name: "Hospitality",
    slug: "hospitality",
    description: "Hotels, resorts, restaurants, lobbies",
  },
  {
    name: "Residential",
    slug: "residential",
    description: "Homes, villas, apartments",
  },
  {
    name: "Office",
    slug: "office",
    description: "Workspaces, conference rooms, lounges",
  },
  {
    name: "Restaurant",
    slug: "restaurant",
    description: "F&B venues, cafés, bars",
  },
];

/**
 * Server-only helper. Returns top-level categories with their subcategories,
 * ordered by `display_order`. Cached per-request by the React 19 server
 * cache when rendered inside a Server Component.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getNavCategories failed:", error.message);
    return [];
  }

  const top = data.filter((c) => c.parent_id === null);
  return top.map((c) => ({
    name: c.name,
    slug: c.slug,
    subcategories: data
      .filter((sub) => sub.parent_id === c.id)
      .map((sub) => ({ name: sub.name, slug: sub.slug })),
  }));
}
