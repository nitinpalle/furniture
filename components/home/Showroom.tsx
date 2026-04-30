"use client";

import Image from "next/image";
import Link from "next/link";

export type ShowroomHotspot = {
  top: string;
  left: string;
  eyebrow: string;
  name: string;
  detail?: string;
};

export type ShowroomRoom = {
  number: string;
  label: string;
  title: string;
  href: string;
  image: string;
  hotspots?: ShowroomHotspot[];
};

type ShowroomProps = {
  rooms: ShowroomRoom[];
};

export function Showroom({ rooms }: ShowroomProps) {
  return (
    <div className="room-scroll overflow-x-auto pb-10 px-6 lg:px-12 snap-x snap-mandatory">
      <div className="room-track">
        {rooms.map((room) => (
          <div key={room.number} className="room snap-center">
            <Image
              src={room.image}
              alt={room.title}
              fill
              sizes="(max-width: 1024px) 80vw, 70vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.3em] text-white/80">
              {room.number} / {room.label}
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <h3 className="font-[var(--font-display)] text-3xl lg:text-5xl text-white">
                {room.title}
              </h3>
              <Link
                href={room.href}
                className="text-[11px] uppercase tracking-[0.24em] text-white hover:text-[var(--color-accent-soft)] transition shrink-0"
              >
                View pieces →
              </Link>
            </div>

            {room.hotspots?.map((hs, i) => (
              <button
                key={i}
                type="button"
                className="hotspot"
                style={{ top: hs.top, left: hs.left }}
                aria-label={`${hs.name} details`}
              >
                <div className="hotspot-card text-left">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-accent)] mb-1">
                    {hs.eyebrow}
                  </p>
                  <p className="font-[var(--font-display)] text-base text-[var(--color-fg)]">
                    {hs.name}
                  </p>
                  {hs.detail && (
                    <p className="text-[11px] text-[var(--color-fg-muted)] mt-2">
                      {hs.detail}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
