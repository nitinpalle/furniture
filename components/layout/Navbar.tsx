"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { NavCategory, NavProjectType } from "@/lib/nav-data";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { SearchOverlay } from "./SearchOverlay";
import { MobileDrawer } from "./MobileDrawer";

type NavbarProps = {
  categories: NavCategory[];
  projectTypes: NavProjectType[];
};

const HIDE_THRESHOLD = 80;

export function Navbar({ categories, projectTypes }: NavbarProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"catalog" | "project" | null>(
    null,
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest < HIDE_THRESHOLD) {
      setHidden(false);
      return;
    }
    if (latest > prev) {
      setHidden(true);
    } else if (prev - latest > 8) {
      setHidden(false);
    }
  });

  // Close dropdowns when navigating
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-dropdown]")) setOpenDropdown(null);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "sticky top-0 z-50 w-full border-b backdrop-blur-md",
          "border-[var(--color-border)] bg-[var(--color-bg)]/80",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-[var(--font-display)] flex-shrink-0 text-lg font-semibold tracking-tight"
          >
            {brand.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            <NavDropdown
              label="Catalog"
              isOpen={openDropdown === "catalog"}
              onToggle={() =>
                setOpenDropdown(openDropdown === "catalog" ? null : "catalog")
              }
            >
              <div className="grid w-[640px] grid-cols-2 gap-x-8 gap-y-6 p-6">
                {categories.map((cat) => (
                  <div key={cat.slug}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="hover:text-[var(--color-accent)] mb-2 block text-sm font-semibold"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {cat.name}
                    </Link>
                    <ul className="space-y-1.5">
                      {cat.subcategories.slice(0, 4).map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/categories/${cat.slug}/${sub.slug}`}
                            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-xs"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="border-[var(--color-border)] col-span-2 -mx-6 -mb-6 mt-2 border-t px-6 py-4">
                  <Link
                    href="/products"
                    className="text-[var(--color-accent)] text-xs font-medium uppercase tracking-wide"
                    onClick={() => setOpenDropdown(null)}
                  >
                    View all products →
                  </Link>
                </div>
              </div>
            </NavDropdown>

            <NavDropdown
              label="Project Type"
              isOpen={openDropdown === "project"}
              onToggle={() =>
                setOpenDropdown(openDropdown === "project" ? null : "project")
              }
            >
              <div className="w-[400px] p-3">
                {projectTypes.map((pt) => (
                  <Link
                    key={pt.slug}
                    href={`/products?project=${pt.slug}`}
                    onClick={() => setOpenDropdown(null)}
                    className="hover:bg-[var(--color-accent-soft)] block rounded-md px-3 py-2.5 transition-colors"
                  >
                    <div className="text-sm font-medium">{pt.name}</div>
                    <div className="text-[var(--color-fg-muted)] text-xs">
                      {pt.description}
                    </div>
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-[var(--color-bg)]/40 rounded-full p-2 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden lg:block">
              <WhatsAppCTA
                variant="compact"
                template="trade-access"
                source="hero"
              >
                Trade Access
              </WhatsAppCTA>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="hover:bg-[var(--color-bg)]/40 rounded-full p-2 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        projectTypes={projectTypes}
      />
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-[var(--color-bg)]/40 rounded-md px-4 py-2 text-sm font-medium",
        "transition-colors duration-150",
      )}
    >
      {children}
    </Link>
  );
}

function NavDropdown({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" data-nav-dropdown>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "hover:bg-[var(--color-bg)]/40 inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium",
          "transition-colors duration-150",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute left-0 top-full mt-2 overflow-hidden rounded-lg border shadow-lg",
            "border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]",
          )}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
