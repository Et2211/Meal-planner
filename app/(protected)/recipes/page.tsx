import { RecipesClient } from "@/components/templates/RecipesClient";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/types";

export default async function RecipesPage() {
  const supabase = await createClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  return <RecipesClient initialRecipes={(recipes ?? []) as Recipe[]} />;
}
