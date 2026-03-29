"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RoundCheckbox } from "@/components/atoms/RoundCheckbox";
import type { Recipe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecipeRowProps {
  recipe: Recipe;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecipeRow = ({ recipe, selected, onToggle, onDelete }: RecipeRowProps) => {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 bg-white rounded-xl border-2 p-3 transition-all",
        selected ? "border-brand-500" : "border-stone-200 hover:border-stone-300"
      )}
    >
      <RoundCheckbox
        checked={selected}
        onChange={() => onToggle(recipe.id)}
        title={selected ? "Remove from shopping list" : "Add to shopping list"}
        size="sm"
      />

      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-stone-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/recipes/${recipe.id}`}>
          <span className="font-medium text-stone-900 text-sm hover:text-brand-600 transition line-clamp-1">
            {recipe.title}
          </span>
        </Link>
        <p className="text-xs text-stone-400 mt-0.5">
          {recipe.ingredients.length} ingredient
          {recipe.ingredients.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-stone-400 hover:text-brand-500 transition"
          title="View original"
        >
          <ExternalLink size={14} />
        </a>
        <button
          onClick={() => onDelete(recipe.id)}
          className="p-1.5 text-stone-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          title="Delete recipe"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
