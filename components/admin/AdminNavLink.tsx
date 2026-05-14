"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function AdminNavLink({ href, icon, children }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/admin"
      ? pathname === "/admin" || pathname === "/admin/"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
