import Link from "next/link";
import { brand } from "@/lib/brand";
import type { NavCategory } from "@/lib/nav-data";
import { WhatsAppCTA } from "./WhatsAppCTA";

type FooterProps = {
  categories: NavCategory[];
};

export function Footer({ categories }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-[var(--color-border)] mt-24 border-t bg-[var(--color-bg-elevated)]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand + WhatsApp */}
          <div>
            <Link href="/" className="font-[var(--font-display)] text-xl font-semibold">
              {brand.name}
            </Link>
            <p className="text-[var(--color-fg-muted)] mt-3 max-w-xs text-sm leading-relaxed">
              {brand.shortTagline}
            </p>
            <div className="mt-6">
              <WhatsAppCTA
                variant="primary"
                template="catalog-request"
                source="footer"
              >
                Request Catalog
              </WhatsAppCTA>
            </div>
          </div>

          {/* Column 2 — Browse */}
          <FooterColumn title="Browse">
            <FooterLink href="/products">All Products</FooterLink>
            {categories.map((cat) => (
              <FooterLink key={cat.slug} href={`/categories/${cat.slug}`}>
                {cat.name}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Column 3 — Company */}
          <FooterColumn title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>

          {/* Column 4 — Trade */}
          <FooterColumn title="Trade">
            <li>
              <Link
                href="/products?project=hospitality"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-sm transition-colors"
              >
                For Hospitality
              </Link>
            </li>
            <li>
              <Link
                href="/products?project=residential"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-sm transition-colors"
              >
                For Designers
              </Link>
            </li>
          </FooterColumn>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-[var(--color-border)] border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:items-center lg:px-8">
          <p className="text-[var(--color-fg-subtle)]">
            © {year} {brand.name}. All rights reserved.
          </p>
          <div className="text-[var(--color-fg-subtle)] flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[var(--color-fg)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-fg)] transition-colors">
              Terms
            </Link>
            <span aria-hidden>·</span>
            <span>Curated globally. Crafted for India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Sub-components
// ============================================================

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[var(--color-fg-subtle)] mb-4 text-xs font-semibold uppercase tracking-widest">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-sm transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
