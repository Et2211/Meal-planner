import { notFound } from "next/navigation";
import { connection } from "next/server";

import { SavedShoppingListView } from "@/components/organisms/SavedShoppingListView";
import { fetchShoppingList } from "@/lib/data/shopping-lists";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SavedShoppingListPage({ params }: Props) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const list = await fetchShoppingList(id, user!.id);
  if (!list) notFound();

  return <SavedShoppingListView list={list} />;
}
