import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { QuickAddButton } from "@/components/atoms/QuickAddButton";
import { StarRating } from "@/components/atoms/StarRating";
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
        {ranked.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-lg font-medium text-stone-500">No ratings yet</p>
            <p className="text-sm mt-1 mb-6">Open a recipe and leave the first rating</p>
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
            {ranked.map(([sourceUrl, entry], index) => (
              <div key={sourceUrl} className="flex items-center gap-4 px-4 py-4">
                <span className="w-6 text-center text-sm font-semibold text-stone-400 flex-shrink-0">
                  {index + 1}
                </span>
                {entry.image_url && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.image_url} alt={entry.title ?? ""} className="w-full h-full object-cover" />
                  </div>
                )}
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 group"
                >
                  <p className="text-sm font-medium text-stone-900 truncate group-hover:text-brand-600 transition">
                    {entry.title ?? new URL(sourceUrl).hostname}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarRating value={Math.round(entry.avg)} />
                    <span className="text-xs text-stone-400">
                      {entry.avg.toFixed(1)} · {entry.count} {entry.count === 1 ? "rating" : "ratings"}
                    </span>
                  </div>
                </a>
                {!savedUrls.has(sourceUrl) && (
                  <QuickAddButton sourceUrl={sourceUrl} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
