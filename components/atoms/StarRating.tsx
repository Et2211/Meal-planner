"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export const StarRating = ({ value, onChange, size = "sm" }: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value ?? 0;
  const px = size === "sm" ? 13 : 18;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(null)}
          className={cn(onChange ? "cursor-pointer" : "cursor-default pointer-events-none")}
        >
          <Star
            size={px}
            className={cn(
              "transition-colors",
              star <= active ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200",
            )}
          />
        </button>
      ))}
    </div>
  );
};
