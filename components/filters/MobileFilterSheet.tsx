"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterPanel } from "./FilterPanel";

type MobileFilterSheetProps = {
  capacities: string[];
  countries: string[];
  basePath?: string;
};

export function MobileFilterSheet({
  capacities,
  countries,
  basePath,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
          "lg:hidden",
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-black/40 fixed inset-0 z-[60] lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col",
                "bg-[var(--color-bg)] rounded-t-xl",
              )}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="border-[var(--color-border)] flex h-14 shrink-0 items-center justify-between border-b px-4">
                <h2 className="font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="hover:bg-[var(--color-border)] -mr-1 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto px-4 py-5"
                style={{
                  paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1.5rem)",
                }}
              >
                <FilterPanel
                  capacities={capacities}
                  countries={countries}
                  basePath={basePath}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
