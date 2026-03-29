import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const ShoppingListEmptyState = () => {
  return (
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
  );
}
