"use client";


import { ArrowLeft, Check, Copy, Plus, Save, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { RoundCheckbox } from "@/components/atoms/RoundCheckbox";
import { Spinner } from "@/components/atoms/Spinner";
import { buildShoppingList, formatShoppingItem } from "@/lib/ingredient-parser";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";

interface ListEntry {
  id: string;
  label: string;
  checked: boolean;
  custom: boolean;
}

export const ShoppingList = () => {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const [listName, setListName] = useState(`Shopping List · ${today}`);
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const stored = sessionStorage.getItem("selected_recipe_ids");
      if (!stored) { setLoading(false); return; }

      let ids: string[];
      try { ids = JSON.parse(stored); } catch { setLoading(false); return; }
      if (!ids.length) { setLoading(false); return; }

      setRecipeIds(ids);
      const { data } = await supabase.from("recipes").select("*").in("id", ids);
      if (data?.length) {
        const loaded = data as Recipe[];
        setRecipes(loaded);
        const items = buildShoppingList(loaded.map((recipe) => recipe.ingredients));
        setEntries(
          items.map((item) => ({
            id: crypto.randomUUID(),
            label: formatShoppingItem(item),
            checked: false,
            custom: false,
          }))
        );
      }
      setLoading(false);
    }
    load();
     
  }, []);

  function toggleEntry(id: string) {
    setEntries((prev) => prev.map((entry) => entry.id === id ? { ...entry, checked: !entry.checked } : entry));
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
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      user_id: user.id,
      name: listName,
      items: entries.map(({ label, checked, custom }) => ({ label, checked, custom })),
      recipe_ids: recipeIds,
    };

    if (savedId) {
      const { error } = await supabase.from("shopping_lists").update(payload).eq("id", savedId);
      // eslint-disable-next-line no-console
      if (error) { console.error("shopping_lists update failed:", error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert(payload)
        .select("id")
        .single();
      // eslint-disable-next-line no-console
      if (error) { console.error("shopping_lists insert failed:", error.message); setSaving(false); return; }
      if (data) setSavedId(data.id as string);
    }

    setSaving(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }

  async function handleCopy() {
    const text = entries.map((entry) => `- ${entry.label}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/recipes"
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <ShoppingCart size={18} className="text-brand-500 flex-shrink-0" />
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="flex-1 min-w-0 font-semibold text-stone-900 bg-transparent outline-none truncate focus:bg-stone-50 focus:px-2 rounded-lg transition-all"
          />
          {entries.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saveFeedback ? <><Check size={14} /> Saved!</> : saving ? <Spinner size="sm" /> : <><Save size={14} /> Save</>}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {entries.length === 0 && !loading ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-medium text-stone-500">No recipes selected</p>
            <p className="text-sm mt-1 mb-6">Go back and check some recipes first</p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              <ArrowLeft size={14} />
              Back to recipes
            </Link>
          </div>
        ) : (
          <>
            {recipes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-stone-500 mb-2">
                  Based on {recipes.length} recipe{recipes.length > 1 ? "s" : ""}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recipes.map((recipe) => (
                    <Badge key={recipe.id} variant="brand">{recipe.title}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-stone-100">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center px-4 py-3 gap-3">
                    <RoundCheckbox
                      size="sm"
                      checked={entry.checked}
                      onChange={() => toggleEntry(entry.id)}
                    />
                    <span className={`flex-1 text-sm capitalize ${entry.checked ? "line-through text-stone-400" : "text-stone-800"}`}>
                      {entry.label}
                    </span>
                    {entry.custom && (
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="text-stone-300 hover:text-stone-500 transition flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
                <Input
                  placeholder="Add a custom item..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCustomItem(); }}
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={addCustomItem} disabled={!customInput.trim()}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
