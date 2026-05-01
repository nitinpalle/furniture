"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// SCHEMAS
// ============================================================

const updateProductSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, {
    message: "Slug must be lowercase alphanumeric with dashes",
  }),
  sku: z.string().max(50).nullable(),
  description: z.string().max(2000).nullable(),
  description_source: z.enum(["manual", "ai"]),
  category_id: z.uuid().nullable(),
  subcategory_id: z.uuid().nullable(),
  series_id: z.uuid().nullable(),
  supplier_id: z.uuid().nullable(),
  country_of_origin: z.string().max(50).nullable(),
  dimensions: z.string().max(120).nullable(),
  material: z.string().max(120).nullable(),
  color: z.string().max(120).nullable(),
  capacity: z.string().max(50).nullable(),
  moq: z.number().int().min(0).nullable(),
  lead_time_days: z.number().int().min(0).nullable(),
  price: z.number().min(0).nullable(),
  project_types: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  image_urls: z.array(z.url()),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

const createProductSchema = updateProductSchema.omit({ id: true });
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Lightweight schema for quick-add multi-row + CSV import.
// Only requires name + slug; other fields default to null.
const bulkCreateRowSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  sku: z.string().max(50).optional().nullable(),
  category_id: z.uuid().nullable().optional(),
  subcategory_id: z.uuid().nullable().optional(),
  dimensions: z.string().max(120).nullable().optional(),
  capacity: z.string().max(50).nullable().optional(),
  material: z.string().max(120).nullable().optional(),
  color: z.string().max(120).nullable().optional(),
  country_of_origin: z.string().max(50).nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type BulkCreateRow = z.infer<typeof bulkCreateRowSchema>;

// ============================================================
// HELPERS
// ============================================================

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return { supabase, user };
}

// ============================================================
// ACTIONS
// ============================================================

export async function updateProduct(input: UpdateProductInput) {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Validation failed",
      issues: parsed.error.issues,
    };
  }

  const { supabase, user } = await getAuthedClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      description_source: data.description_source,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      series_id: data.series_id,
      supplier_id: data.supplier_id,
      country_of_origin: data.country_of_origin,
      dimensions: data.dimensions,
      material: data.material,
      color: data.color,
      capacity: data.capacity,
      moq: data.moq,
      lead_time_days: data.lead_time_days,
      price: data.price,
      project_types: data.project_types,
      status: data.status,
      is_featured: data.is_featured,
      image_urls: data.image_urls,
      updated_by: user.id,
    })
    .eq("id", data.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  // Revalidate every place this product might be rendered.
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/admin/products/${data.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { ok: true as const };
}

export async function softDeleteProduct(id: string) {
  const { supabase, user } = await getAuthedClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);
  if (error) {
    return { ok: false as const, error: error.message };
  }
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { ok: true as const };
}

// ============================================================
// CREATE — single product (manual form)
// ============================================================

export async function createProduct(input: CreateProductInput) {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Validation failed",
      issues: parsed.error.issues,
    };
  }

  const { supabase, user } = await getAuthedClient();
  const data = parsed.data;

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      description_source: data.description_source,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      series_id: data.series_id,
      supplier_id: data.supplier_id,
      country_of_origin: data.country_of_origin,
      dimensions: data.dimensions,
      material: data.material,
      color: data.color,
      capacity: data.capacity,
      moq: data.moq,
      lead_time_days: data.lead_time_days,
      price: data.price,
      project_types: data.project_types,
      status: data.status,
      is_featured: data.is_featured,
      image_urls: data.image_urls,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id, slug")
    .single();

  if (error) {
    const isDuplicate =
      error.code === "23505" || error.message.toLowerCase().includes("duplicate");
    return {
      ok: false as const,
      error: isDuplicate
        ? `A product with slug "${data.slug}" already exists. Choose a different slug.`
        : error.message,
    };
  }

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  if (data.status === "published") {
    revalidatePath(`/products/${data.slug}`);
  }

  return { ok: true as const, id: inserted.id, slug: inserted.slug };
}

// ============================================================
// CREATE — multiple products at once (quick-add OR csv import)
// ============================================================

export async function createProductsBulk(rows: BulkCreateRow[]) {
  const { supabase, user } = await getAuthedClient();

  const validated: BulkCreateRow[] = [];
  const errors: { row: number; message: string }[] = [];

  rows.forEach((row, i) => {
    const parsed = bulkCreateRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push({
        row: i + 1,
        message: parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; "),
      });
      return;
    }
    validated.push(parsed.data);
  });

  if (validated.length === 0) {
    return { ok: false as const, error: "No valid rows", errors, created: 0 };
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert(
      validated.map((r) => ({
        name: r.name,
        slug: r.slug,
        sku: r.sku ?? null,
        category_id: r.category_id ?? null,
        subcategory_id: r.subcategory_id ?? null,
        dimensions: r.dimensions ?? null,
        capacity: r.capacity ?? null,
        material: r.material ?? null,
        color: r.color ?? null,
        country_of_origin: r.country_of_origin ?? null,
        status: r.status,
        created_by: user.id,
        updated_by: user.id,
      })),
    )
    .select("id, slug");

  if (error) {
    return {
      ok: false as const,
      error: error.message.includes("duplicate")
        ? "One or more slugs already exist. Slugs must be unique."
        : error.message,
      errors,
      created: 0,
    };
  }

  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return {
    ok: true as const,
    created: inserted?.length ?? 0,
    skipped: errors.length,
    errors,
    rows: inserted ?? [],
  };
}

// ============================================================
// AUTH
// ============================================================

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
