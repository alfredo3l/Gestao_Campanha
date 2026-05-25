import { cn } from "@/lib/utils/cn";

interface Props {
  value: number;
  max?: number;
  className?: string;
  tone?: "brand" | "green" | "amber" | "red";
}

export function ProgressBar({ value, max = 100, className, tone = "brand" }: Props) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  const toneClass = {
    brand: "bg-brand-500",
    green: "bg-green-500",
    amber: "bg-status-amber",
    red: "bg-status-red",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <div className={cn("h-full rounded-full transition-all", toneClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}
