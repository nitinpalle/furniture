import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Box, MessageCircle, Package, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    publishedRes,
    draftRes,
    featuredRes,
    suppliersRes,
    weekClicksRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true)
      .is("deleted_at", null),
    supabase.from("suppliers").select("*", { count: "exact", head: true }),
    supabase
      .from("enquiry_clicks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("products")
      .select("id, slug, name, sku, status, image_urls, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  return {
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    featured: featuredRes.count ?? 0,
    suppliers: suppliersRes.count ?? 0,
    weekClicks: weekClicksRes.count ?? 0,
    recent: recentRes.data ?? [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <header className="mb-8">
        <p className="text-[var(--color-fg-subtle)] text-[10px] font-semibold uppercase tracking-[0.2em]">
          Overview
        </p>
        <h1 className="font-[var(--font-display)] mt-1 text-3xl font-medium tracking-tight">
          Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <KPICard
          icon={<Package className="h-4 w-4" />}
          label="Published"
          value={stats.published}
          sub={`${stats.draft} drafts`}
        />
        <KPICard
          icon={<Star className="h-4 w-4" />}
          label="Featured"
          value={stats.featured}
          sub={`of ${stats.published} live`}
        />
        <KPICard
          icon={<Box className="h-4 w-4" />}
          label="Suppliers"
          value={stats.suppliers}
        />
        <KPICard
          icon={<MessageCircle className="h-4 w-4" />}
          label="Enquiry clicks"
          value={stats.weekClicks}
          sub="last 7 days"
        />
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-[var(--color-fg)] text-base font-semibold">
            Recently updated
          </h2>
          <Link
            href="/admin/products"
            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] inline-flex items-center gap-1 text-xs"
          >
            All products
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ul className="border-[var(--color-border)] divide-[var(--color-border)] divide-y rounded-lg border bg-[var(--color-bg-elevated)]">
          {stats.recent.length === 0 ? (
            <li className="text-[var(--color-fg-muted)] p-6 text-center text-sm">
              No products yet.
            </li>
          ) : (
            stats.recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 px-4 py-3 sm:px-6"
              >
                <div className="bg-[var(--color-accent-soft)] relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  {p.image_urls?.[0] && (
                    <Image
                      src={p.image_urls[0]}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-[var(--color-fg)] hover:text-[var(--color-accent)] block truncate text-sm font-medium transition-colors"
                  >
                    {p.name}
                  </Link>
                  <p className="text-[var(--color-fg-subtle)] truncate text-xs">
                    SKU {p.sku ?? "—"}
                  </p>
                </div>
                <StatusPill status={p.status} />
                <Link
                  href={`/admin/products/${p.id}`}
                  className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hidden text-xs sm:inline"
                >
                  Edit →
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="border-[var(--color-border)] bg-[var(--color-bg-elevated)] rounded-lg border p-4">
      <div className="text-[var(--color-fg-subtle)] flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="text-[var(--color-fg)] mt-2 font-mono text-2xl font-medium">
        {value.toLocaleString()}
      </div>
      {sub && (
        <div className="text-[var(--color-fg-subtle)] mt-0.5 text-xs">
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
        status === "published"
          ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
          : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
      )}
    >
      {status}
    </span>
  );
}
