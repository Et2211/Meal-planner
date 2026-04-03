"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

import { RecipeImage } from "@/components/atoms/RecipeImage";
import { RoundCheckbox } from "@/components/atoms/RoundCheckbox";
import { StarRating } from "@/components/atoms/StarRating";
import type { RatingInfo, Recipe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  avgRating: RatingInfo | null;
}

export const RecipeCard = ({
  recipe,
  selected,
  onToggle,
  onDelete,
  avgRating,
}: RecipeCardProps) => {
  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl border-2 transition-all overflow-hidden",
        selected
          ? "border-brand-500 shadow-md"
          : "border-stone-200 hover:border-stone-300",
      )}
    >
      <RoundCheckbox
        checked={selected}
        onChange={() => onToggle(recipe.id)}
        title={selected ? "Remove from shopping list" : "Add to shopping list"}
        size="md"
        className="absolute top-3 left-3"
      />

      <button
        onClick={() => onDelete(recipe.id)}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center text-stone-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 transition"
        title="Delete recipe"
      >
        <Trash2 size={13} />
      </button>

      <Link href={`/recipes/${recipe.id}`}>
        <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
          <RecipeImage src={recipe.image_url ?? ""} alt={recipe.title} />
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 hover:text-brand-600 transition">
            {recipe.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-stone-400">
            {recipe.ingredients.length} ingredient
            {recipe.ingredients.length !== 1 ? "s" : ""}
          </span>
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-brand-500 transition"
              title="View original"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        {avgRating && (
          <div className="flex items-center gap-1 mt-1.5">
            <StarRating value={Math.round(avgRating.avg)} />
            <span className="text-xs text-stone-400">
              {avgRating.avg.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
