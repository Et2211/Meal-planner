"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildShoppingList, formatShoppingItem, shoppingListToText } from "@/lib/ingredient-parser";
import type { Recipe, ShoppingListItem } from "@/lib/types";

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const stored = sessionStorage.getItem("selected_recipe_ids");
      if (!stored) { setLoading(false); return; }

      let ids: string[];
      try { ids = JSON.parse(stored); } catch { setLoading(false); return; }
      if (!ids.length) { setLoading(false); return; }

      const { data } = await supabase
        .from("recipes")
        .select("*")
        .in("id", ids);

      if (data && data.length > 0) {
        const loaded = data as Recipe[];
        setRecipes(loaded);
        setItems(buildShoppingList(loaded.map((r) => r.ingredients)));
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopy() {
    const text = shoppingListToText(items);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/recipes"
              className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="font-semibold text-stone-900 flex items-center gap-2">
              <ShoppingCart size={18} className="text-brand-500" />
              Shopping List
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition border border-stone-300 hover:bg-stone-50 text-stone-700"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy list
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {items.length === 0 ? (
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
            {/* Recipe summary */}
            {recipes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-stone-500 mb-2">
                  Based on {recipes.length} recipe{recipes.length > 1 ? "s" : ""}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recipes.map((r) => (
                    <span
                      key={r.id}
                      className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full"
                    >
                      {r.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shopping list */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-stone-100">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between px-4 py-3 gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
                      <span className="text-sm text-stone-800 capitalize">
                        {formatShoppingItem(item)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition"
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy list to clipboard
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
