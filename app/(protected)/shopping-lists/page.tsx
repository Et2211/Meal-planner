import { ClipboardList } from "lucide-react";
import { connection } from "next/server";

import { PageEmptyState } from "@/components/atoms/PageEmptyState";
import { PageHeader } from "@/components/atoms/PageHeader";
import { ShoppingListRowItem } from "@/components/molecules/ShoppingListRowItem";
import { fetchUserShoppingLists } from "@/lib/data/shopping-lists";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/formatDate";

export default async function ShoppingListsPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lists = await fetchUserShoppingLists(user!.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        backHref="/recipes"
        title="Saved Lists"
        icon={<ClipboardList size={18} className="text-brand-500" />}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {lists.length === 0 ? (
          <PageEmptyState
            emoji="📋"
            title="No saved lists yet"
            subtitle="Select some recipes and save a shopping list"
            ctaHref="/recipes"
            ctaLabel="Back to recipes"
          />
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
            {lists.map((list) => (
              <ShoppingListRowItem
                key={list.id}
                id={list.id}
                name={list.name}
                checkedCount={list.items.filter((item) => item.checked).length}
                totalCount={list.items.length}
                date={formatDate(list.created_at, true)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
