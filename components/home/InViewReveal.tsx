"use client";

import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that adds `.in` to any element with
 * the `.iv` class once it scrolls into view. Keeps the markup declarative
 * (server components can write `className="iv"`) without each section
 * needing its own client wrapper.
 */
export function InViewReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".iv");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
