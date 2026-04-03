import { ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface ShoppingListRowItemProps {
  id: string;
  name: string;
  checkedCount: number;
  totalCount: number;
  date: string;
}

export const ShoppingListRowItem = ({
  id,
  name,
  checkedCount,
  totalCount,
  date,
}: ShoppingListRowItemProps) => {
  return (
    <Link
      href={`/shopping-lists/${id}`}
      className="flex items-center gap-4 px-4 py-4 hover:bg-stone-50 transition group"
    >
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
        <ShoppingCart size={16} className="text-brand-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">{name}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {checkedCount}/{totalCount} items · {date}
        </p>
      </div>
      <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-400 flex-shrink-0 transition" />
    </Link>
  );
};
