"use client";

import { useEffect } from "react";

/**
 * Site-wide scroll-reveal hook. Observes any element with the `.iv` class
 * and adds `.in` once it enters the viewport, which the CSS in globals.css
 * then animates with the shared motion primitives.
 *
 * Mounted once in app/layout.tsx so it works on every route. A MutationObserver
 * picks up newly-mounted nodes (client-side navigation, expanding accordions,
 * filter-driven re-renders) without needing each page to re-mount the hook.
 */
export function InViewReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const observe = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(".iv:not(.in)").forEach((el) => {
        io.observe(el);
      });
    };

    observe(document);

    const mo = new MutationObserver((muts) => {
      for (const mut of muts) {
        mut.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList?.contains("iv") && !node.classList.contains("in")) {
            io.observe(node);
          }
          observe(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
