import { RecipesClient } from "@/components/templates/RecipesClient";
import { createClient } from "@/lib/supabase/server";
import type { RatingInfo, Recipe } from "@/lib/types";

export default async function RecipesPage() {
  const supabase = await createClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  const recipeList = (recipes ?? []) as Recipe[];
  const sourceUrls = recipeList.map((recipe) => recipe.source_url);

  const { data: ratings } = sourceUrls.length
    ? await supabase
        .from("recipe_ratings")
        .select("source_url, rating")
        .in("source_url", sourceUrls)
    : { data: [] };

  const avgRatings: Record<string, RatingInfo> = {};
  for (const { source_url, rating } of ratings ?? []) {
    if (!avgRatings[source_url]) avgRatings[source_url] = { avg: 0, count: 0 };
    const info = avgRatings[source_url];
    info.avg = (info.avg * info.count + rating) / (info.count + 1);
    info.count += 1;
  }

  return <RecipesClient initialRecipes={recipeList} avgRatings={avgRatings} />;
}
