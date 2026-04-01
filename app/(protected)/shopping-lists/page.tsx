import { ArrowLeft, ChevronRight, ClipboardList, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { fetchUserShoppingLists } from "@/lib/data/shopping-lists";
import { createClient } from "@/lib/supabase/server";

export default async function ShoppingListsPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lists = await fetchUserShoppingLists(user!.id);

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
          <ClipboardList size={18} className="text-brand-500" />
          <span className="font-semibold text-stone-900">Saved Lists</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {lists.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium text-stone-500">No saved lists yet</p>
            <p className="text-sm mt-1 mb-6">Select some recipes and save a shopping list</p>
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
            {lists.map((list) => {
              const total = list.items.length;
              const checked = list.items.filter((item) => item.checked).length;
              const date = new Date(list.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <Link
                  key={list.id}
                  href={`/shopping-lists/${list.id}`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-stone-50 transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={16} className="text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{list.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {checked}/{total} items · {date}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-400 flex-shrink-0 transition" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
