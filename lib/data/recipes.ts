import { cacheTag } from "next/cache";

import { createServiceClient } from "@/lib/supabase/service";
import type { RatingInfo, Recipe } from "@/lib/types";

export async function fetchUserRecipes(userId: string): Promise<Recipe[]> {
  "use cache";
  cacheTag(`recipes-${userId}`);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Recipe[];
}

export async function fetchRecipe(id: string, userId: string): Promise<Recipe | null> {
  "use cache";
  cacheTag(`recipe-${id}`);
  cacheTag(`recipes-${userId}`);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return data as Recipe | null;
}

export async function fetchAllRatings(): Promise<{ source_url: string; user_id: string; rating: number; title: string | null; image_url: string | null }[]> {
  "use cache";
  cacheTag("ratings");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("recipe_ratings")
    .select("source_url, user_id, rating, title, image_url");
  return data ?? [];
}

export async function fetchRatingsForUrl(sourceUrl: string): Promise<{ user_id: string; rating: number }[]> {
  "use cache";
  cacheTag("ratings");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("recipe_ratings")
    .select("user_id, rating")
    .eq("source_url", sourceUrl);
  return data ?? [];
}

export function computeAvgRatings(
  ratings: { source_url: string; rating: number }[],
): Record<string, RatingInfo> {
  const map: Record<string, RatingInfo> = {};
  for (const { source_url, rating } of ratings) {
    if (!map[source_url]) map[source_url] = { avg: 0, count: 0 };
    const info = map[source_url];
    info.avg = (info.avg * info.count + rating) / (info.count + 1);
    info.count += 1;
  }
  return map;
}
