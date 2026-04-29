"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ImageManagerProps = {
  productSlug: string;
  value: string[];
  onChange: (urls: string[]) => void;
};

/**
 * Image management for the admin edit form.
 * - Shows current image_urls as a grid with delete + reorder controls.
 * - Upload button: client-side direct upload to Supabase Storage
 *   (products bucket) using the user's auth token. RLS lets
 *   authenticated users write.
 * - On upload, the public URL is appended to the value.
 *
 * Note: this uploads at original size. The catalog importer pre-resizes
 * via sharp; admin uploads are expected to be already-sized assets.
 */
export function ImageManager({ productSlug, value, onChange }: ImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Path: products/{slug}/admin-{timestamp}-{name}
        // Original filename gets sanitized to avoid Supabase Storage rejecting weird chars.
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${productSlug}/admin-${Date.now()}-${safeName}`;
        const { error: uploadErr } = await supabase.storage
          .from("products")
          .upload(path, file, {
            contentType: file.type || "image/webp",
            upsert: false,
          });
        if (uploadErr) {
          throw new Error(uploadErr.message);
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      onChange([...value, ...newUrls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="border-[var(--color-border-strong)] bg-[var(--color-bg)] rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-[var(--color-fg-muted)] text-sm">
            No images yet. Upload one to get started.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <li
              key={url + i}
              className="border-[var(--color-border)] group relative overflow-hidden rounded-lg border bg-[var(--color-accent-soft)]"
            >
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Image ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-[var(--color-bg-elevated)]/95 absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 backdrop-blur">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move left"
                    className={cn(
                      "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-7 w-7 items-center justify-center rounded-md border",
                      "disabled:opacity-30 disabled:pointer-events-none",
                    )}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    aria-label="Move right"
                    className={cn(
                      "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-7 w-7 items-center justify-center rounded-md border",
                      "disabled:opacity-30 disabled:pointer-events-none",
                    )}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Delete image"
                  className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 inline-flex h-7 w-7 items-center justify-center rounded-md"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              {i === 0 && (
                <span className="bg-[var(--color-fg)] text-[var(--color-bg)] absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                  Primary
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <p className="text-[var(--color-fg-subtle)] text-xs">
          Multiple files allowed. JPEG / PNG / WebP.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-md border p-3 text-xs"
        >
          {error}
        </div>
      )}
    </div>
  );
}
