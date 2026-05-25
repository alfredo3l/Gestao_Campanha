import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-2xs font-medium uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-100 text-brand-800",
        secondary: "border-transparent bg-ink-100 text-ink-700",
        outline: "border-ink-200 text-ink-700",
        red: "border-transparent bg-status-red-100 text-status-red",
        amber: "border-transparent bg-status-amber-100 text-status-amber",
        green: "border-transparent bg-status-green-100 text-status-green",
        blue: "border-transparent bg-status-blue-100 text-status-blue",
        violet: "border-transparent bg-status-violet-100 text-status-violet",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
