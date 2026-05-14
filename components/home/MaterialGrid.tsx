import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type Material = {
  name: string;
  origin: string;
  count: number;
  image: string;
  query: string;
};

type MaterialGridProps = {
  materials: Material[];
};

/**
 * Macro material library — chips in a 2 / 3 / 4-col grid. Each card is a
 * close-up of a material (oak grain, boucle, marble, brass…) with name and
 * origin in mono uppercase. Clicking filters the listing by material.
 *
 * Macro photography reads well even at stock quality, so this section
 * sidesteps the lifestyle-photo problem the previous homepage had.
 */
export function MaterialGrid({ materials }: MaterialGridProps) {
  return (
    <ul className="iv-stagger grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {materials.map((m) => (
        <li key={m.name} className="iv">
          <Link
            href={`/products?material=${m.query}`}
            className={cn(
              "group/mat relative block aspect-[4/5] overflow-hidden rounded-lg border border-[var(--color-border)]",
              "transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]",
              "hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
            )}
          >
            <Image
              src={m.image}
              alt={`${m.name} — macro detail`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/mat:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-white">
              <div>
                <h3 className="font-[var(--font-display)] text-xl font-medium leading-tight md:text-2xl">
                  {m.name}
                </h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/75">
                  {m.origin}
                </p>
              </div>
              <span className="font-[var(--font-display)] text-base tabular-nums text-white/75">
                {m.count}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
