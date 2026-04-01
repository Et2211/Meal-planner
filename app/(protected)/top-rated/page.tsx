import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/atoms/StarRating";
import { createClient } from "@/lib/supabase/server";
import type { RatingInfo, Recipe } from "@/lib/types";

export default async function TopRatedPage() {
  const supabase = await createClient();

  const [{ data: recipes }, { data: ratings }] = await Promise.all([
    supabase.from("recipes").select("*"),
    supabase.from("recipe_ratings").select("source_url, rating"),
  ]);

  // Compute avg per source_url
  const ratingMap: Record<string, RatingInfo> = {};
  for (const { source_url, rating } of ratings ?? []) {
    if (!ratingMap[source_url]) ratingMap[source_url] = { avg: 0, count: 0 };
    const info = ratingMap[source_url];
    info.avg = (info.avg * info.count + rating) / (info.count + 1);
    info.count += 1;
  }

  // Join user's recipes with ratings and sort by avg descending
  const rated = (recipes ?? ([] as Recipe[]))
    .filter((recipe) => ratingMap[recipe.source_url])
    .map((recipe) => ({
      recipe: recipe as Recipe,
      info: ratingMap[recipe.source_url],
    }))
    .sort(
      (first, second) =>
        second.info.avg - first.info.avg ||
        second.info.count - first.info.count,
    );

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/recipes"
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="font-semibold text-stone-900">Top Rated</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {rated.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-lg font-medium text-stone-500">No ratings yet</p>
            <p className="text-sm mt-1 mb-6">
              Open a recipe and leave the first rating
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              <ArrowLeft size={14} />
              Back to recipes
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
            {rated.map(({ recipe, info }, index) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-stone-50 transition group"
              >
                <span className="w-6 text-center text-sm font-semibold text-stone-400 flex-shrink-0">
                  {index + 1}
                </span>
                {recipe.image_url && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate group-hover:text-brand-600 transition">
                    {recipe.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarRating value={Math.round(info.avg)} />
                    <span className="text-xs text-stone-400">
                      {info.avg.toFixed(1)} · {info.count}{" "}
                      {info.count === 1 ? "rating" : "ratings"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
