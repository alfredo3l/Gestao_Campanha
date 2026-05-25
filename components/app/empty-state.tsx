import { cn } from "@/lib/utils/cn";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-200 bg-white px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="rounded-full bg-ink-100 p-3 text-ink-500">{icon}</div>}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-ink-900">{title}</p>
        {description && <p className="max-w-md text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
