"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui";

/**
 * Back + Search buttons overlaid on the mobile PDP gallery.
 * Absolute-positioned within the gallery wrapper — they scroll out of
 * view with the gallery, never sticking to the viewport.
 *
 * Mobile-only (`lg:hidden`). The desktop nav stays visible on >=lg, so
 * desktop users use the global navbar's search icon and browser back.
 */
export function MobileGalleryOverlay() {
  const router = useRouter();
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/products");
    }
  }

  const buttonCls = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full",
    "bg-white/90 text-[var(--color-fg)] backdrop-blur-md",
    "border border-black/5 shadow-md",
    "transition-colors hover:bg-white",
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 lg:hidden">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className={cn(buttonCls, "pointer-events-auto")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search"
        className={cn(buttonCls, "pointer-events-auto")}
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
