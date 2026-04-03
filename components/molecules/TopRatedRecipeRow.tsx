import { StarRating } from "@/components/atoms/StarRating";
import { QuickAddButton } from "@/components/molecules/QuickAddButton";

interface TopRatedRecipeRowProps {
  rank: number;
  sourceUrl: string;
  title: string | null;
  imageUrl: string | null;
  avgRating: number;
  ratingCount: number;
  isSaved: boolean;
}

export const TopRatedRecipeRow = ({
  rank,
  sourceUrl,
  title,
  imageUrl,
  avgRating,
  ratingCount,
  isSaved,
}: TopRatedRecipeRowProps) => {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <span className="w-6 text-center text-sm font-semibold text-stone-400 flex-shrink-0">
        {rank}
      </span>
      {imageUrl && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title ?? ""} className="w-full h-full object-cover" />
        </div>
      )}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 group"
      >
        <p className="text-sm font-medium text-stone-900 truncate group-hover:text-brand-600 transition">
          {title ?? new URL(sourceUrl).hostname}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StarRating value={Math.round(avgRating)} />
          <span className="text-xs text-stone-400">
            {avgRating.toFixed(1)} · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
          </span>
        </div>
      </a>
      {!isSaved && <QuickAddButton sourceUrl={sourceUrl} />}
    </div>
  );
};
