import { connection } from "next/server";

import { PageEmptyState } from "@/components/atoms/PageEmptyState";
import { PageHeader } from "@/components/atoms/PageHeader";
import { TopRatedRecipeRow } from "@/components/molecules/TopRatedRecipeRow";
import { createClient } from "@/lib/supabase/server";

export default async function TopRatedPage() {
  await connection();
  const supabase = await createClient();

  const [{ data: ratings }, { data: saved }] = await Promise.all([
    supabase.from("recipe_ratings").select("source_url, rating, title, image_url"),
    supabase.from("recipes").select("source_url"),
  ]);

  const savedUrls = new Set((saved ?? []).map((row) => row.source_url));

  // Group by source_url — compute avg, take title/image from any row
  const map: Record<string, { avg: number; count: number; title: string | null; image_url: string | null }> = {};
  for (const row of ratings ?? []) {
    if (!map[row.source_url]) {
      map[row.source_url] = { avg: 0, count: 0, title: row.title ?? null, image_url: row.image_url ?? null };
    }
    const entry = map[row.source_url];
    entry.avg = (entry.avg * entry.count + row.rating) / (entry.count + 1);
    entry.count += 1;
    if (!entry.title && row.title) entry.title = row.title;
    if (!entry.image_url && row.image_url) entry.image_url = row.image_url;
  }

  const ranked = Object.entries(map)
    .sort(([, first], [, second]) => second.avg - first.avg || second.count - first.count);

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader backHref="/recipes" title="Top Rated" />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {ranked.length === 0 ? (
          <PageEmptyState
            emoji="⭐"
            title="No ratings yet"
            subtitle="Open a recipe and leave the first rating"
            ctaHref="/recipes"
            ctaLabel="Back to recipes"
          />
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
            {ranked.map(([sourceUrl, entry], index) => (
              <TopRatedRecipeRow
                key={sourceUrl}
                rank={index + 1}
                sourceUrl={sourceUrl}
                title={entry.title}
                imageUrl={entry.image_url}
                avgRating={entry.avg}
                ratingCount={entry.count}
                isSaved={savedUrls.has(sourceUrl)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
