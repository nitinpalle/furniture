import { cn } from "@/lib/utils";

export type Workshop = {
  city: string;
  country: string;
  craft: string;
};

type ProvenanceProps = {
  workshops: Workshop[];
};

/**
 * The Provenance band — eight workshops listed typographically.
 *
 * No map (yet) — the map gets fragile quickly without real data, and the
 * type lockup already does the emotional work. A real geographic SVG can
 * land in a follow-up once we have workshop coordinates.
 */
export function Provenance({ workshops }: ProvenanceProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 iv-stagger">
      {workshops.map((w) => (
        <div key={w.city} className="iv border-t border-[var(--color-border-strong)] pt-5">
          <p
            className={cn(
              "font-[var(--font-display)] text-2xl font-light tracking-tight md:text-3xl",
            )}
          >
            {w.city}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
            {w.country}
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
            {w.craft}
          </p>
        </div>
      ))}
    </div>
  );
}
