import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PlaceholderPageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  comingIn?: string;
};

/**
 * Generic placeholder for routes that exist for navigation but aren't
 * built out yet. Used during Phase 2 to scaffold every public route so
 * Navbar links don't 404. Replaced with real pages in subsequent phases.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  comingIn,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
      {eyebrow && (
        <p className="text-[var(--color-fg-subtle)] mb-3 text-xs font-mono uppercase tracking-widest">
          {eyebrow}
        </p>
      )}
      <h1 className="font-[var(--font-display)] text-3xl font-medium tracking-tight md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="text-[var(--color-fg-muted)] mx-auto mt-4 max-w-xl text-balance">
          {description}
        </p>
      )}
      {comingIn && (
        <div className="border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] mt-10 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]"
            aria-hidden
          />
          <span className="text-[var(--color-fg-muted)]">
            Coming in {comingIn}
          </span>
        </div>
      )}
      <div className="mt-12">
        <Link
          href="/"
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </div>
  );
}
