"use client";

import { useCallback, useMemo, useState } from "react";

import { type ViewMode, ViewToggle } from "@/components/molecules/ViewToggle";
import { AddRecipeForm } from "@/components/organisms/AddRecipeForm";
import { Navbar } from "@/components/organisms/Navbar";
import { RecipeCard } from "@/components/organisms/RecipeCard";
import { RecipeRow } from "@/components/organisms/RecipeRow";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";

interface RecipesClientProps {
  initialRecipes: Recipe[];
}

export const RecipesClient = ({ initialRecipes }: RecipesClientProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [search, setSearch] = useState("");
  // Filter recipes by search query (title or ingredient)
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;
    const query = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (recipe.title.toLowerCase().includes(query)) return true;
      return recipe.ingredients.some(
        (ing) =>
          ing.name?.toLowerCase().includes(query) ||
          ing.raw?.toLowerCase().includes(query),
      );
    });
  }, [recipes, search]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("grid");

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", id);
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleAdded() {
    const supabase = createClient();
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecipes(data as Recipe[]);
  }

  function handleGoToShoppingList() {
    sessionStorage.setItem(
      "selected_recipe_ids",
      JSON.stringify([...selected]),
    );
  }

  return (
    <>
      <Navbar
        selectedCount={selected.size}
        onShoppingListClick={handleGoToShoppingList}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-stone-900 mb-4">
            Add a recipe
          </h2>
          <AddRecipeForm onAdded={handleAdded} />
        </div>

        {recipes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Your recipes
                <span className="text-stone-400 font-normal text-base ml-2">
                  ({filteredRecipes.length} of {recipes.length})
                </span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="border border-stone-300 rounded px-3 py-1 text-base w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-200"
                aria-label="Search recipes"
              />
              <div className="flex items-center gap-3">
                {selected.size > 0 && (
                  <span className="text-sm text-brand-600 font-medium">
                    {selected.size} selected
                  </span>
                )}
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>
          </div>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">🍳</div>
            <p className="text-lg font-medium text-stone-500">No recipes yet</p>
            <p className="text-sm mt-1">
              Paste a recipe URL above to get started
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={selected.has(recipe.id)}
                onToggle={toggleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecipes.map((recipe) => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                selected={selected.has(recipe.id)}
                onToggle={toggleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
