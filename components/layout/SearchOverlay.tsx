"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui";

/**
 * Sitewide search modal. Renders once at the layout level; opened by any
 * caller that flips `searchOpen` in the UI store (Navbar icon, mobile PDP
 * gallery overlay, etc.).
 */
export function SearchOverlay() {
  const router = useRouter();
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setOpen(false);
  }, [setOpen]);

  // Lock scroll + Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    close();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] bg-[var(--color-bg)]/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          onClick={close}
        >
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-32 max-w-2xl px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-[var(--color-bg-elevated)] px-4",
                "border-[var(--color-border-strong)] shadow-lg",
              )}
            >
              <Search
                className="text-[var(--color-fg-muted)] h-5 w-5 shrink-0"
                aria-hidden
              />
              <input
                ref={inputRef}
                autoFocus
                type="search"
                placeholder="Search products by name, SKU, or material…"
                className="text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] flex-1 bg-transparent py-4 text-base outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] -mr-1 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
            <p className="text-[var(--color-fg-subtle)] mt-3 text-center text-xs">
              Press{" "}
              <kbd className="bg-[var(--color-border)] rounded px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to search ·{" "}
              <kbd className="bg-[var(--color-border)] rounded px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
