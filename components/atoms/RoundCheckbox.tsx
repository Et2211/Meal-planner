"use client";

import { cn } from "@/lib/utils";

type Size = "sm" | "md";

interface RoundCheckboxProps {
  checked: boolean;
  onChange: () => void;
  title?: string;
  size?: Size;
  className?: string;
}

const sizes: Record<Size, { container: string; viewBox: string; w: number; h: number }> = {
  sm: { container: "w-5 h-5", viewBox: "0 0 10 8", w: 9, h: 7 },
  md: { container: "w-6 h-6", viewBox: "0 0 10 8", w: 10, h: 8 },
};

export function RoundCheckbox({
  checked,
  onChange,
  title,
  size = "md",
  className,
}: RoundCheckboxProps) {
  const s = sizes[size];
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      className={cn(
        "rounded-full border-2 flex items-center justify-center transition flex-shrink-0",
        s.container,
        checked
          ? "bg-brand-500 border-brand-500"
          : "bg-white/80 border-stone-300 hover:border-brand-400",
        className
      )}
    >
      {checked && (
        <svg width={s.w} height={s.h} viewBox={s.viewBox} fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
