import { notFound, redirect } from "next/navigation";

import { SavedShoppingListView } from "@/components/organisms/SavedShoppingListView";
import { createClient } from "@/lib/supabase/server";
import type { SavedShoppingList } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SavedShoppingListPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <SavedShoppingListView list={data as SavedShoppingList} />;
}
