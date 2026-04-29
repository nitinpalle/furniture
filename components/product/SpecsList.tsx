import { cn } from "@/lib/utils";
import { flagFor } from "@/lib/country";

type Spec = {
  label: string;
  value: string;
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
  /** Hide the section heading (parent already provides one). */
  hideHeading?: boolean;
};

/**
 * Key attributes / specs section. Halden-style flat key-value rows on mobile;
 * 2-column on desktop. Values use a mono font for the "data" feel.
 */
export function SpecsList({ specs, className, hideHeading }: SpecsListProps) {
  const flag = flagFor(specs.countryOfOrigin);

  const rows: Spec[] = [
    { label: "SKU", value: specs.sku ?? "" },
    { label: "Dimensions", value: specs.dimensions ?? "" },
    { label: "Seats", value: specs.capacity ?? "" },
    { label: "Material", value: specs.material ?? "" },
    { label: "Finish", value: specs.color ?? "" },
    {
      label: "Country of origin",
      value: specs.countryOfOrigin
        ? `${flag ? flag + " " : ""}${specs.countryOfOrigin}`
        : "",
    },
    { label: "Series", value: specs.series ?? "" },
    {
      label: "Paired with",
      value: specs.pairedChair ? `Chair ${specs.pairedChair}` : "",
    },
    {
      label: "MOQ",
      value: specs.moq != null ? `${specs.moq} units` : "",
    },
    {
      label: "Lead time",
      value:
        specs.leadTimeDays != null
          ? `${specs.leadTimeDays}–${specs.leadTimeDays + 15} days`
          : "",
    },
  ].filter((r) => r.value.length > 0);

  if (rows.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {!hideHeading && (
        <h2 className="text-[var(--color-fg-subtle)] text-xs font-semibold uppercase tracking-widest">
          Key attributes
        </h2>
      )}
      <dl>
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "border-[var(--color-border)] flex items-baseline justify-between gap-4 py-3.5",
              i < rows.length - 1 && "border-b",
            )}
          >
            <dt className="text-[var(--color-fg-subtle)] text-[11px] uppercase tracking-widest">
              {row.label}
            </dt>
            <dd className="text-[var(--color-fg)] text-right font-mono text-sm font-medium">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
