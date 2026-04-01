import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeImage } from "@/components/atoms/RecipeImage";
import { formatShoppingItem } from "@/lib/ingredient-parser";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/types";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (!recipe) notFound();

  const recipeObj = recipe as Recipe;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/recipes"
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="font-semibold text-stone-900 truncate">
            {recipeObj.title}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {recipeObj.image_url && (
          <RecipeImage src={recipeObj.image_url} alt={recipeObj.title} variant="detail" />
        )}

        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-stone-900">
            {recipeObj.title}
          </h1>
          <a
            href={recipeObj.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <ExternalLink size={14} />
            Source
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">
              Ingredients
              <span className="text-stone-400 font-normal text-sm ml-2">
                ({recipeObj.ingredients.length})
              </span>
            </h2>
            <ul className="space-y-2">
              {recipeObj.ingredients.map((ing, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-stone-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                  {formatShoppingItem({
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    entries: [ing.raw],
                  })}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">
              Instructions
              <span className="text-stone-400 font-normal text-sm ml-2">
                ({recipeObj.instructions.length} steps)
              </span>
            </h2>
            <ol className="space-y-4">
              {recipeObj.instructions.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-stone-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
