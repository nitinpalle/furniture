import { brand } from "@/lib/brand";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-[var(--color-fg-subtle)] font-mono text-xs uppercase tracking-widest">
        Phase 0 · Setup complete
      </p>
      <h1 className="font-[var(--font-display)] text-4xl font-medium md:text-6xl">
        {brand.name}
      </h1>
      <p className="text-[var(--color-fg-muted)] max-w-md text-pretty">
        {brand.tagline}
      </p>
      <p className="text-[var(--color-fg-subtle)] mt-8 text-sm">
        Public site shell ships in Phase 2.
      </p>
    </main>
  );
}
