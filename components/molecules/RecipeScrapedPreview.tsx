"use client";

import Image from "next/image";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import type { ScrapedRecipe } from "@/lib/types";

interface RecipeScrapedPreviewProps {
  recipe: ScrapedRecipe;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function RecipeScrapedPreview({
  recipe,
  isSaving,
  onSave,
  onCancel,
}: RecipeScrapedPreviewProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex gap-4 p-4">
        {recipe.image_url && (
          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-stone-100">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900">{recipe.title}</h3>
          <p className="text-sm text-stone-500 mt-0.5">
            {recipe.ingredients.length} ingredients · {recipe.instructions.length} steps
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.ingredients.slice(0, 5).map((ing, i) => (
              <Badge key={i}>{ing.name}</Badge>
            ))}
            {recipe.ingredients.length > 5 && (
              <span className="text-xs text-stone-400">
                +{recipe.ingredients.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {isSaving ? "Saving…" : "Save recipe"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          <X size={14} />
          Cancel
        </Button>
      </div>
    </div>
  );
}
