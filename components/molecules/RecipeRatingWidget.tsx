"use client";

import { useState } from "react";

import { StarRating } from "@/components/atoms/StarRating";
import { createClient } from "@/lib/supabase/client";

interface RecipeRatingWidgetProps {
  sourceUrl: string;
  title: string;
  imageUrl: string | null;
  initialAvg: number | null;
  initialCount: number;
  initialUserRating: number | null;
}

export const RecipeRatingWidget = ({
  sourceUrl,
  title,
  imageUrl,
  initialAvg,
  initialCount,
  initialUserRating,
}: RecipeRatingWidgetProps) => {
  const [userRating, setUserRating] = useState(initialUserRating);
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);

  async function handleRate(rating: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("recipe_ratings").upsert(
      { user_id: user.id, source_url: sourceUrl, rating, title, image_url: imageUrl },
      { onConflict: "user_id,source_url" },
    );

    // Optimistic average update
    const isNew = userRating === null;
    const newCount = isNew ? count + 1 : count;
    const newSum = (avg ?? 0) * count - (userRating ?? 0) + rating;
    setAvg(newSum / newCount);
    setCount(newCount);
    setUserRating(rating);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <div className="flex items-center gap-1.5">
        <StarRating value={avg !== null ? Math.round(avg) : null} />
        <span className="text-xs text-stone-400">
          {avg !== null ? `${avg.toFixed(1)} (${count})` : "No ratings yet"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-stone-500">Your rating:</span>
        <StarRating value={userRating} onChange={handleRate} />
      </div>
    </div>
  );
};
