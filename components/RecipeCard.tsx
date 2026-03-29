"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, selected, onToggle, onDelete }: RecipeCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl border-2 transition-all overflow-hidden",
        selected ? "border-brand-500 shadow-md" : "border-stone-200 hover:border-stone-300"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(recipe.id)}
        className={cn(
          "absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition",
          selected
            ? "bg-brand-500 border-brand-500"
            : "bg-white/80 border-stone-300 group-hover:border-stone-400"
        )}
        title={selected ? "Remove from shopping list" : "Add to shopping list"}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(recipe.id)}
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center text-stone-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 transition"
        title="Delete recipe"
      >
        <Trash2 size={13} />
      </button>

      {/* Image */}
      <Link href={`/recipes/${recipe.id}`}>
        <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">
              🍽️
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 hover:text-brand-600 transition">
            {recipe.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-stone-400">
            {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""}
          </span>
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-brand-500 transition"
            title="View original"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
