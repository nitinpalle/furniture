"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Plus, Rows } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Add product" split-button: primary action (single manual create)
 * with a dropdown for the multi-row + CSV import variants.
 */
export function AddProductMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <Link
        href="/admin/products/new"
        className={cn(
          "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)]",
          "inline-flex h-9 items-center gap-1.5 rounded-l-md px-4 text-xs font-semibold",
        )}
      >
        <Plus className="h-3 w-3" />
        Add product
      </Link>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="More add options"
        aria-expanded={open}
        className={cn(
          "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)]",
          "border-l border-white/10 inline-flex h-9 items-center justify-center rounded-r-md px-2",
        )}
      >
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          className={cn(
            "border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] absolute right-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border shadow-lg",
          )}
        >
          <MenuItem
            href="/admin/products/new"
            icon={<Plus className="h-3.5 w-3.5" />}
            title="Add a single product"
            sub="Full manual form"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            href="/admin/products/new/quick"
            icon={<Rows className="h-3.5 w-3.5" />}
            title="Add multiple products"
            sub="Quick-add 3-10 at a time"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            href="/admin/products/new/import"
            icon={<FileText className="h-3.5 w-3.5" />}
            title="Bulk import"
            sub="Upload a CSV"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  title,
  sub,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "hover:bg-[var(--color-accent-soft)] flex items-start gap-2.5 px-3 py-2.5",
      )}
    >
      <span className="text-[var(--color-fg-muted)] mt-0.5">{icon}</span>
      <span className="block">
        <span className="text-[var(--color-fg)] block text-xs font-semibold">
          {title}
        </span>
        <span className="text-[var(--color-fg-subtle)] mt-0.5 block text-[11px]">
          {sub}
        </span>
      </span>
    </Link>
  );
}
