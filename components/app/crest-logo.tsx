import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
}

export function CrestLogo({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid h-11 w-11 place-items-center rounded-lg font-display text-xl font-bold text-gold-500",
        "bg-[linear-gradient(155deg,#1d6aa0,#0a2540_70%)]",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
        className
      )}
    >
      GP
    </div>
  );
}
