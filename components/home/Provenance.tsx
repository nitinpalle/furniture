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
 * Compact provenance band — workshops listed typographically. Each
 * card stays small so this section reads as a trust signal rather than
 * a hero feature.
 */
export function Provenance({ workshops }: ProvenanceProps) {
  return (
    <ul className="iv-stagger grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
      {workshops.map((w) => (
        <li
          key={w.city}
          className={cn("iv border-t border-[var(--color-border-strong)] pt-4")}
        >
          <p className="font-[var(--font-display)] text-lg font-light tracking-tight md:text-xl">
            {w.city}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
            {w.country}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
            {w.craft}
          </p>
        </li>
      ))}
    </ul>
  );
}
