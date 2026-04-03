"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { RecipeEditor, type RecipePayload } from "@/components/organisms/RecipeEditor";
import { revalidateRecipe } from "@/lib/actions/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";

interface EditRecipeClientProps {
  recipe: Recipe;
}

export function EditRecipeClient({ recipe }: EditRecipeClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave(payload: RecipePayload) {
    setIsSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSaving(false); return; }

    const { error: dbError } = await supabase
      .from("recipes")
      .update({
        title: payload.title,
        image_url: payload.image_url,
        ingredients: payload.ingredients,
        instructions: payload.instructions,
      })
      .eq("id", recipe.id)
      .eq("user_id", user.id);

    if (dbError) {
      setError(dbError.message);
      setIsSaving(false);
      return;
    }

    await revalidateRecipe(recipe.id, user.id);
    router.push(`/recipes/${recipe.id}`);
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>
      )}
      <RecipeEditor
        initial={{
          title: recipe.title,
          image_url: recipe.image_url,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        }}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
