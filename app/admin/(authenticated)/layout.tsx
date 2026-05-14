import Link from "next/link";
import { LayoutDashboard, LogOut, Package } from "lucide-react";
import { brand } from "@/lib/brand";
import { signOut } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

/**
 * Admin chrome — wraps the dashboard, product list, and edit pages.
 * /admin/login stays outside this group so it renders without the
 * navbar/sign-out chrome.
 *
 * Auth guard runs at the layout level so every nested route is gated;
 * proxy.ts also redirects unauthenticated requests as defence-in-depth.
 */
export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="bg-[var(--color-bg)] flex min-h-screen flex-col">
      <header className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] sticky top-0 z-30 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-[var(--font-display)] text-base font-semibold"
            >
              {brand.name}
              <span className="text-[var(--color-fg-subtle)] ml-1.5 text-[10px] font-mono uppercase tracking-widest">
                · Admin
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Admin">
              <AdminNavLink
                href="/admin"
                icon={<LayoutDashboard className="h-3.5 w-3.5" />}
              >
                Dashboard
              </AdminNavLink>
              <AdminNavLink
                href="/admin/products"
                icon={<Package className="h-3.5 w-3.5" />}
              >
                Products
              </AdminNavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hidden text-xs sm:inline"
            >
              View site →
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className={cn(
                  "border-[var(--color-border-strong)] hover:bg-[var(--color-accent-soft)] inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium",
                )}
              >
                <LogOut className="h-3 w-3" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav row */}
        <nav
          className="border-[var(--color-border)] flex items-center gap-1 border-t px-4 py-2 sm:hidden"
          aria-label="Admin mobile"
        >
          <AdminNavLink
            href="/admin"
            icon={<LayoutDashboard className="h-3.5 w-3.5" />}
          >
            Dashboard
          </AdminNavLink>
          <AdminNavLink
            href="/admin/products"
            icon={<Package className="h-3.5 w-3.5" />}
          >
            Products
          </AdminNavLink>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
