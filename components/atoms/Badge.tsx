import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "default" | "brand";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  default: "bg-stone-100 text-stone-600",
  brand: "bg-brand-50 text-brand-700 border border-brand-100",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn("text-xs px-2.5 py-0.5 rounded-full", variants[variant], className)}
    >
      {children}
    </span>
  );
}
