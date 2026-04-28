import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";

type Spec = {
  label: string;
  value: string | null | undefined;
  monospace?: boolean;
};

type SpecsListProps = {
  specs: {
    sku: string | null;
    dimensions: string | null;
    capacity: string | null;
    material: string | null;
    color: string | null;
    countryOfOrigin: string | null;
    moq: number | null;
    leadTimeDays: number | null;
    series: string | null;
    pairedChair?: string | null;
  };
  className?: string;
};

/**
 * Key attributes / specs section on the PDP.
 * Renders all fields we actually have; gracefully omits empty ones.
 */
export function SpecsList({ specs, className }: SpecsListProps) {
  const flag = flagFor(specs.countryOfOrigin);

  const rows: Spec[] = [
    { label: "SKU", value: specs.sku, monospace: true },
    { label: "Dimensions", value: specs.dimensions },
    { label: "Seats", value: specs.capacity },
    { label: "Material", value: specs.material },
    { label: "Finish", value: specs.color },
    {
      label: "Country of origin",
      value: specs.countryOfOrigin
        ? `${flag ? flag + " " : ""}${specs.countryOfOrigin}`
        : null,
    },
    { label: "Series", value: specs.series },
    {
      label: "Paired with",
      value: specs.pairedChair ? `Chair ${specs.pairedChair}` : null,
    },
    {
      label: "MOQ",
      value: specs.moq != null ? `${specs.moq} units` : null,
    },
    {
      label: "Lead time",
      value:
        specs.leadTimeDays != null
          ? `${specs.leadTimeDays}–${specs.leadTimeDays + 15} days`
          : null,
    },
  ].filter((r) => Boolean(r.value)) as Spec[];

  if (rows.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-[var(--color-fg)] text-base font-semibold">
        Key attributes
      </h2>
      <dl className="border-[var(--color-border)] grid grid-cols-1 divide-y rounded-lg border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex items-center justify-between gap-4 px-4 py-3 sm:flex-col sm:items-start sm:gap-1",
              "sm:py-3",
              i % 2 === 0 ? "sm:border-b" : "sm:border-b",
              i >= rows.length - (rows.length % 2 === 0 ? 2 : 1) &&
                "sm:!border-b-0",
              "sm:border-[var(--color-border)]",
            )}
          >
            <dt className="text-[var(--color-fg-subtle)] text-xs uppercase tracking-wide">
              {row.label}
            </dt>
            <dd
              className={cn(
                "text-[var(--color-fg)] text-sm font-medium",
                row.monospace && "font-mono",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
