"use client";

import { usePathname } from "next/navigation";

/**
 * Hides its children when the current route is under /admin.
 * Used in the root layout to suppress the public Navbar/Footer/Floating
 * WhatsApp button on admin pages without restructuring the route tree.
 */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
