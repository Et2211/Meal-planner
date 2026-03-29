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

const sizes: Record<
  Size,
  { container: string; viewBox: string; width: number; height: number }
> = {
  sm: { container: "w-5 h-5", viewBox: "0 0 10 8", width: 9, height: 7 },
  md: { container: "w-6 h-6", viewBox: "0 0 10 8", width: 10, height: 8 },
};

export const RoundCheckbox = ({
  checked,
  onChange,
  title,
  size = "md",
  className,
}: RoundCheckboxProps) => {
  const sizeConfig = sizes[size];
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      className={cn(
        "rounded-full border-2 flex items-center justify-center transition flex-shrink-0",
        sizeConfig.container,
        checked
          ? "bg-brand-500 border-brand-500"
          : "bg-white/80 border-stone-300 hover:border-brand-400",
        className,
      )}
    >
      {checked && (
        <svg
          width={sizeConfig.width}
          height={sizeConfig.height}
          viewBox={sizeConfig.viewBox}
          fill="none"
        >
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
};
