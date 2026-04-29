import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx + tailwind-merge.
 * Always use this when conditionally combining classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert text into a URL-safe slug.
 * "Marble-Top Dining Table" → "marble-top-dining-table"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9\s-]/g, "") // drop non-alphanumeric
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
