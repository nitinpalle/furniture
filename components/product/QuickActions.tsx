"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickActionsProps = {
  productName: string;
  className?: string;
};

/**
 * Mobile-only secondary action row: Share + Copy link.
 * Mirrors the Halden quick action row but adapted for our model
 * (no Save / Sample — we don't have accounts or sample shipping).
 */
export function QuickActions({ productName, className }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);

  function getUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  async function handleShare() {
    const url = getUrl();
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: productName, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    await copyToClipboard(url);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers — silent fail; nothing critical here.
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-accent-soft)] inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium",
          "transition-colors duration-150",
        )}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>
      <button
        type="button"
        onClick={() => copyToClipboard(getUrl())}
        className={cn(
          "border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-accent-soft)] inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium",
          "transition-colors duration-150",
        )}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" aria-hidden />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
