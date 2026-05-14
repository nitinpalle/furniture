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
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between py-4 text-left text-base font-medium",
          "text-[var(--color-fg)] transition-colors duration-[var(--duration-fast)]",
          "hover:text-[var(--color-accent)]",
          "focus-visible:outline-none focus-visible:text-[var(--color-accent)]",
        )}
      >
        <span className="font-[var(--font-display)] tracking-tight">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--color-fg-muted)]",
            "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
            open && "rotate-180 text-[var(--color-accent)]",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div
            className={cn(
              "text-sm leading-relaxed text-[var(--color-fg-muted)]",
              "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]",
              open ? "translate-y-0" : "-translate-y-1",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
