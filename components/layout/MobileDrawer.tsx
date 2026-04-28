"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { NavCategory, NavProjectType } from "@/lib/nav-data";
import { WhatsAppCTA } from "./WhatsAppCTA";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  projectTypes: NavProjectType[];
};

export function MobileDrawer({
  open,
  onClose,
  categories,
  projectTypes,
}: MobileDrawerProps) {
  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "fixed inset-0 z-[60] flex flex-col",
            "bg-[var(--color-bg)] lg:hidden",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* Header */}
          <div className="border-[var(--color-border)] flex h-16 items-center justify-between border-b px-4">
            <span className="font-[var(--font-display)] text-lg font-semibold">
              {brand.name}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="hover:bg-[var(--color-border)] -mr-1 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-8 px-4 py-6">
              <Section title="Catalog">
                <DrawerLink href="/products" onClose={onClose}>
                  All products
                </DrawerLink>
                {categories.map((cat) => (
                  <DrawerLink
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    onClose={onClose}
                  >
                    {cat.name}
                  </DrawerLink>
                ))}
              </Section>

              <Section title="Project Type">
                {projectTypes.map((pt) => (
                  <DrawerLink
                    key={pt.slug}
                    href={`/products?project=${pt.slug}`}
                    onClose={onClose}
                  >
                    {pt.name}
                  </DrawerLink>
                ))}
              </Section>

              <Section title="Company">
                <DrawerLink href="/about" onClose={onClose}>
                  About
                </DrawerLink>
                <DrawerLink href="/contact" onClose={onClose}>
                  Contact
                </DrawerLink>
              </Section>
            </div>
          </div>

          {/* Bottom-pinned WhatsApp CTA */}
          <div
            className={cn(
              "border-[var(--color-border)] border-t p-4",
              "bg-[var(--color-bg-elevated)]",
              "pb-[max(env(safe-area-inset-bottom,1rem),1rem)]",
            )}
          >
            <WhatsAppCTA
              variant="sticky"
              template="trade-access"
              source="hero"
            >
              Request Trade Access
            </WhatsAppCTA>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[var(--color-fg-subtle)] mb-2 px-3 text-xs font-semibold uppercase tracking-widest">
        {title}
      </h3>
      <ul>{children}</ul>
    </section>
  );
}

function DrawerLink({
  href,
  onClose,
  children,
}: {
  href: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "flex items-center justify-between rounded-md px-3 py-3",
          "text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]",
          "transition-colors duration-150",
        )}
      >
        <span className="text-base font-medium">{children}</span>
        <ChevronRight
          className="text-[var(--color-fg-subtle)] h-4 w-4"
          aria-hidden
        />
      </Link>
    </li>
  );
}
