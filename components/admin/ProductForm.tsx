"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageManager } from "./ImageManager";
import {
  softDeleteProduct,
  updateProduct,
  type UpdateProductInput,
} from "@/lib/admin/actions";
import type { Product } from "@/lib/database.types";

const PROJECT_TYPES = [
  { value: "hospitality", label: "Hospitality" },
  { value: "residential", label: "Residential" },
  { value: "office", label: "Office" },
  { value: "restaurant", label: "Restaurant" },
] as const;

// Local form schema — uses strings for numeric fields so the inputs can
// be empty strings; coerces to number/null at submit time.
const formSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, dashes only"),
  sku: z.string(),
  description: z.string(),
  description_source: z.enum(["manual", "ai"]),
  category_id: z.string(),
  subcategory_id: z.string(),
  series_id: z.string(),
  supplier_id: z.string(),
  country_of_origin: z.string(),
  dimensions: z.string(),
  material: z.string(),
  color: z.string(),
  capacity: z.string(),
  moq: z.string(),
  lead_time_days: z.string(),
  price: z.string(),
  project_types: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  image_urls: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  product: Product;
  topCategories: { id: string; name: string; slug: string }[];
  subcategories: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  }[];
  suppliers: { id: string; name: string; country: string }[];
  series: { id: string; name: string; slug: string }[];
};

export function ProductForm({
  product,
  topCategories,
  subcategories,
  suppliers,
  series,
}: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? "",
      description: product.description ?? "",
      description_source:
        product.description_source === "ai" ? "ai" : "manual",
      category_id: product.category_id ?? "",
      subcategory_id: product.subcategory_id ?? "",
      series_id: product.series_id ?? "",
      supplier_id: product.supplier_id ?? "",
      country_of_origin: product.country_of_origin ?? "",
      dimensions: product.dimensions ?? "",
      material: product.material ?? "",
      color: product.color ?? "",
      capacity: product.capacity ?? "",
      moq: product.moq != null ? String(product.moq) : "",
      lead_time_days:
        product.lead_time_days != null ? String(product.lead_time_days) : "",
      price: product.price != null ? String(product.price) : "",
      project_types: product.project_types ?? [],
      status: product.status === "published" ? "published" : "draft",
      is_featured: product.is_featured,
      image_urls: product.image_urls ?? [],
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedCategoryId = watch("category_id");
  const visibleSubcategories = subcategories.filter(
    (s) => s.parent_id === selectedCategoryId,
  );

  function toPayload(v: FormValues): UpdateProductInput {
    const numOrNull = (s: string) => {
      if (!s.trim()) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    return {
      id: v.id,
      name: v.name.trim(),
      slug: v.slug.trim(),
      sku: v.sku.trim() || null,
      description: v.description.trim() || null,
      description_source: v.description_source,
      category_id: v.category_id || null,
      subcategory_id: v.subcategory_id || null,
      series_id: v.series_id || null,
      supplier_id: v.supplier_id || null,
      country_of_origin: v.country_of_origin.trim() || null,
      dimensions: v.dimensions.trim() || null,
      material: v.material.trim() || null,
      color: v.color.trim() || null,
      capacity: v.capacity.trim() || null,
      moq: numOrNull(v.moq),
      lead_time_days: numOrNull(v.lead_time_days),
      price: numOrNull(v.price),
      project_types: v.project_types,
      status: v.status,
      is_featured: v.is_featured,
      image_urls: v.image_urls,
    };
  }

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProduct(toPayload(values));
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    });
  };

  function onDelete() {
    if (!confirm("Soft-delete this product? It will be hidden from the public site but remains recoverable.")) return;
    setServerError(null);
    startTransition(async () => {
      const result = await softDeleteProduct(product.id);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push("/admin/products");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Save banner */}
      <div
        className={cn(
          "border-[var(--color-border)] sticky top-14 z-20 -mx-4 mb-2 flex items-center justify-between gap-3 border-b bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8",
        )}
      >
        <div className="text-xs">
          {serverError ? (
            <span className="text-[var(--color-danger)]">{serverError}</span>
          ) : savedAt ? (
            <span className="text-[var(--color-success)]">
              Saved at {savedAt}
            </span>
          ) : isDirty ? (
            <span className="text-[var(--color-warning)]">Unsaved changes</span>
          ) : (
            <span className="text-[var(--color-fg-subtle)]">No changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className={cn(
              "border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          <button
            type="submit"
            disabled={pending || !isDirty}
            className={cn(
              "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)] inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-xs font-semibold",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Basic */}
      <Section title="Basic">
        <Field label="Name" error={errors.name?.message}>
          <input className={inputCls} {...register("name")} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slug" error={errors.slug?.message} hint="Public URL: /products/{slug}">
            <input className={inputCls} {...register("slug")} />
          </Field>
          <Field label="SKU">
            <input className={inputCls} {...register("sku")} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Field label="Status" inline>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value as "draft" | "published")
                  }
                  className={inputCls}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              )}
            />
          </Field>
          <Field label="Featured on home" inline>
            <Controller
              control={control}
              name="is_featured"
              render={({ field }) => (
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border-strong)]"
                  />
                  <span className="text-sm">Yes</span>
                </label>
              )}
            />
          </Field>
        </div>
      </Section>

      {/* Description */}
      <Section title="Description">
        <Field label="Body">
          <textarea
            rows={5}
            className={cn(inputCls, "resize-y leading-relaxed")}
            {...register("description")}
          />
        </Field>
        <Field label="Source" inline>
          <select className={inputCls} {...register("description_source")}>
            <option value="manual">Manual</option>
            <option value="ai">AI-generated</option>
          </select>
        </Field>
      </Section>

      {/* Categorization */}
      <Section title="Categorization">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select className={inputCls} {...register("category_id")}>
              <option value="">— None —</option>
              {topCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sub-category">
            <select
              className={inputCls}
              {...register("subcategory_id")}
              disabled={!selectedCategoryId}
            >
              <option value="">— None —</option>
              {visibleSubcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Series">
            <select className={inputCls} {...register("series_id")}>
              <option value="">— None —</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Supplier (private)" hint="Hidden from public site">
            <select className={inputCls} {...register("supplier_id")}>
              <option value="">— None —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.country})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Project types">
          <Controller
            control={control}
            name="project_types"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((pt) => {
                  const checked = field.value.includes(pt.value);
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => {
                        field.onChange(
                          checked
                            ? field.value.filter((v) => v !== pt.value)
                            : [...field.value, pt.value],
                        );
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        checked
                          ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]"
                          : "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)]",
                      )}
                    >
                      {pt.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>
      </Section>

      {/* Specs */}
      <Section title="Specs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Dimensions" hint="e.g. 300 × 100 × 76 cm">
            <input className={inputCls} {...register("dimensions")} />
          </Field>
          <Field label="Capacity" hint="e.g. Seats 8">
            <input className={inputCls} {...register("capacity")} />
          </Field>
          <Field label="Material">
            <input className={inputCls} {...register("material")} />
          </Field>
          <Field label="Finish / Color">
            <input className={inputCls} {...register("color")} />
          </Field>
          <Field label="Country of origin">
            <input className={inputCls} {...register("country_of_origin")} />
          </Field>
        </div>
      </Section>

      {/* Trade */}
      <Section title="Trade">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="MOQ (units)">
            <input
              type="number"
              min={0}
              className={inputCls}
              {...register("moq")}
            />
          </Field>
          <Field label="Lead time (days)">
            <input
              type="number"
              min={0}
              className={inputCls}
              {...register("lead_time_days")}
            />
          </Field>
          <Field label="Price (INR)" hint="Hidden from public site">
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              {...register("price")}
            />
          </Field>
        </div>
      </Section>

      {/* Media */}
      <Section title="Media">
        <Controller
          control={control}
          name="image_urls"
          render={({ field }) => (
            <ImageManager
              productSlug={product.slug}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>
    </form>
  );
}

// ============================================================
// Layout primitives
// ============================================================

const inputCls = cn(
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
  "border-[var(--color-border-strong)] focus:border-[var(--color-fg)] focus:outline-none",
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] space-y-4 rounded-lg border p-5 lg:p-6">
      <h2 className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-[0.2em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  inline,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(inline ? "flex items-center gap-3" : undefined)}>
      <label className="text-[var(--color-fg)] block text-xs font-medium">
        {label}
        {hint && (
          <span className="text-[var(--color-fg-subtle)] ml-1.5 font-normal">
            · {hint}
          </span>
        )}
      </label>
      <div className={cn(inline ? "" : "mt-1.5")}>{children}</div>
      {error && (
        <p className="text-[var(--color-danger)] mt-1 text-xs">{error}</p>
      )}
    </div>
  );
}
