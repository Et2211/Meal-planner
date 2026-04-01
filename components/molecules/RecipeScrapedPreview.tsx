"use client";

import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { StarRating } from "@/components/atoms/StarRating";
import { createClient } from "@/lib/supabase/client";
import type { RatingInfo, ScrapedRecipe } from "@/lib/types";

interface RecipeScrapedPreviewProps {
  recipe: ScrapedRecipe;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RecipeScrapedPreview = ({
  recipe,
  isSaving,
  onSave,
  onCancel,
}: RecipeScrapedPreviewProps) => {
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);

  useEffect(() => {
    async function fetchRating() {
      const supabase = createClient();
      const { data } = await supabase
        .from("recipe_ratings")
        .select("rating")
        .eq("source_url", recipe.source_url);
      if (data?.length) {
        const avg = data.reduce((sum, row) => sum + row.rating, 0) / data.length;
        setRatingInfo({ avg, count: data.length });
      }
    }
    fetchRating();
  }, [recipe.source_url]);

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
            {recipe.ingredients.length} ingredients ·{" "}
            {recipe.instructions.length} steps
          </p>
          {ratingInfo && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating value={Math.round(ratingInfo.avg)} />
              <span className="text-xs text-stone-400">
                {ratingInfo.avg.toFixed(1)} ({ratingInfo.count})
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.ingredients.slice(0, 5).map((ing, idx) => (
              <Badge key={idx}>{ing.name}</Badge>
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
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {isSaving ? "Saving…" : "Save recipe"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          <X size={14} />
          Cancel
        </Button>
      </div>
    </div>
  );
};
