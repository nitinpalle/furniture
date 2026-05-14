"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type HeroScene = {
  src: string;
  alt: string;
  label: string;
};

type HeroScenesProps = {
  scenes: HeroScene[];
  intervalMs?: number;
};

export function HeroScenes({ scenes, intervalMs = 4500 }: HeroScenesProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (scenes.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % scenes.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scenes.length, intervalMs]);

  return (
    <>
      {scenes.map((scene, i) => (
        <div key={scene.src} className={`scene ${i === active ? "active" : ""}`}>
          <Image
            src={scene.src}
            alt={scene.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Scene indicator strip — hero is always over imagery, so colors stay light */}
      <div className="absolute bottom-10 lg:bottom-12 left-6 lg:left-12 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/70">
        {scenes.map((_, i) => (
          <span
            key={i}
            className={`h-px transition-all duration-500 ${
              i === active
                ? "w-8 bg-[var(--color-accent-soft)]"
                : "w-8 bg-white/30"
            }`}
          />
        ))}
        <span className="ml-3">{scenes[active]?.label}</span>
      </div>
    </>
  );
}
