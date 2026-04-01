import { connection } from "next/server";

import { RecipesClient } from "@/components/templates/RecipesClient";
import { computeAvgRatings, fetchAllRatings, fetchUserRecipes } from "@/lib/data/recipes";
import { createClient } from "@/lib/supabase/server";

export default async function RecipesPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [recipes, ratings] = await Promise.all([
    fetchUserRecipes(user!.id),
    fetchAllRatings(),
  ]);

  return <RecipesClient initialRecipes={recipes} avgRatings={computeAvgRatings(ratings)} />;
}
