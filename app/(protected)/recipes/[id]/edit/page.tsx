import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditRecipeClient } from "@/components/organisms/EditRecipeClient";
import { fetchRecipe } from "@/lib/data/recipes";
import { createClient } from "@/lib/supabase/server";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const recipe = await fetchRecipe(id, user!.id);
  if (!recipe) notFound();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/recipes/${id}`}
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="font-semibold text-stone-900 truncate">
            Edit — {recipe.title}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <EditRecipeClient recipe={recipe} />
      </main>
    </div>
  );
}
