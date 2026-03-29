import { Badge } from "@/components/atoms/Badge";
import type { Recipe } from "@/lib/types";

interface ShoppingListRecipeBadgesProps {
  recipes: Recipe[];
}

export const ShoppingListRecipeBadges = ({
  recipes,
}: ShoppingListRecipeBadgesProps) => {
  if (!recipes.length) return null;
  return (
    <div className="mb-6">
      <p className="text-sm text-stone-500 mb-2">
        Based on {recipes.length} recipe{recipes.length > 1 ? "s" : ""}:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {recipes.map((recipe) => (
          <Badge key={recipe.id} variant="brand">
            {recipe.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}
