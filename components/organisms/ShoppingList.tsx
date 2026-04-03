"use client";

import { useEffect, useState } from "react";

import { PageEmptyState } from "@/components/atoms/PageEmptyState";
import { ShoppingListCustomInput } from "@/components/atoms/ShoppingListCustomInput";
import { ShoppingListEntries } from "@/components/atoms/ShoppingListEntries";
import { ShoppingListHeader } from "@/components/atoms/ShoppingListHeader";
import { ShoppingListRecipeBadges } from "@/components/atoms/ShoppingListRecipeBadges";
import { Spinner } from "@/components/atoms/Spinner";
import { revalidateUserShoppingLists } from "@/lib/actions/revalidate";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { useShoppingListSave } from "@/lib/hooks/useShoppingListSave";
import { buildShoppingList, formatShoppingItem } from "@/lib/ingredient-parser";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";
import { formatDate } from "@/lib/utils/formatDate";

interface ListEntry {
  id: string;
  label: string;
  checked: boolean;
  custom: boolean;
}

export const ShoppingList = () => {
  const [listName, setListName] = useState(`Shopping List · ${formatDate(new Date())}`);
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { saving, saveFeedback, withSave } = useShoppingListSave();
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const stored = sessionStorage.getItem("selected_recipe_ids");
      if (!stored) {
        setLoading(false);
        return;
      }

      let ids: string[];
      try {
        ids = JSON.parse(stored);
      } catch {
        setLoading(false);
        return;
      }
      if (!ids.length) {
        setLoading(false);
        return;
      }

      setRecipeIds(ids);
      const { data } = await supabase.from("recipes").select("*").in("id", ids);
      if (data?.length) {
        const loaded = data as Recipe[];
        setRecipes(loaded);
        const items = buildShoppingList(
          loaded.map((recipe) => recipe.ingredients),
        );
        setEntries(
          items.map((item) => ({
            id: crypto.randomUUID(),
            label: formatShoppingItem(item),
            checked: false,
            custom: false,
          })),
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleEntry(id: string) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, checked: !entry.checked } : entry,
      ),
    );
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  function addCustomItem() {
    const label = customInput.trim();
    if (!label) return;
    setEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, checked: false, custom: true },
    ]);
    setCustomInput("");
  }

  async function handleSave() {
    await withSave(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        name: listName,
        items: entries.map(({ label, checked, custom }) => ({ label, checked, custom })),
        recipe_ids: recipeIds,
      };

      if (savedId) {
        const { error } = await supabase.from("shopping_lists").update(payload).eq("id", savedId);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("shopping_lists update failed:", error.message);
          return;
        }
      } else {
        const { data, error } = await supabase.from("shopping_lists").insert(payload).select("id").single();
        if (error) {
          // eslint-disable-next-line no-console
          console.error("shopping_lists insert failed:", error.message);
          return;
        }
        if (data) setSavedId(data.id as string);
      }

      await revalidateUserShoppingLists(user.id);
    });
  }

  function handleCopy() {
    const text = entries.map((entry) => `- ${entry.label}`).join("\n");
    copy(text);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <ShoppingListHeader
        listName={listName}
        setListName={setListName}
        entriesLength={entries.length}
        handleCopy={handleCopy}
        copied={copied}
        handleSave={handleSave}
        saving={saving}
        saveFeedback={saveFeedback}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <PageEmptyState
            emoji="🛒"
            title="No recipes selected"
            subtitle="Go back and check some recipes first"
            ctaHref="/recipes"
            ctaLabel="Back to recipes"
          />
        ) : (
          <>
            <ShoppingListRecipeBadges recipes={recipes} />
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <ShoppingListEntries
                entries={entries}
                toggleEntry={toggleEntry}
                removeEntry={removeEntry}
              />
              <ShoppingListCustomInput
                customInput={customInput}
                setCustomInput={setCustomInput}
                addCustomItem={addCustomItem}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};
