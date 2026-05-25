import { cn } from "@/lib/utils/cn";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function KpiCard({ label, value, hint, trend, className }: Props) {
  return (
    <div className={cn("rounded-lg border border-ink-200 bg-white p-4 shadow-sm", className)}>
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular text-ink-900">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
        {trend && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-2xs font-medium tabular",
              trend.positive
                ? "bg-status-green-100 text-status-green"
                : "bg-status-red-100 text-status-red"
            )}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
