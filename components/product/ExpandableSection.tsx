"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpandableSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/**
 * Accordion row used in the lower part of the PDP for "Materials & care",
 * "Trade pricing & terms", "Shipping & lead time" — info that's useful
 * but not above-the-fold critical.
 */
export function ExpandableSection({
  title,
  defaultOpen = false,
  children,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-[var(--color-border)] border-b">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "text-[var(--color-fg)] flex w-full items-center justify-between py-4 text-left text-base font-semibold",
          "hover:text-[var(--color-accent)] transition-colors",
        )}
      >
        {title}
        <ChevronDown
          className={cn(
            "text-[var(--color-fg-muted)] h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300",
          open
            ? "grid-rows-[1fr] opacity-100 pb-4"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="text-[var(--color-fg-muted)] text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
