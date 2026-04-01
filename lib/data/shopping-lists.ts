import { cacheTag } from "next/cache";

import { createServiceClient } from "@/lib/supabase/service";
import type { SavedShoppingList } from "@/lib/types";

export async function fetchUserShoppingLists(
  userId: string,
): Promise<Pick<SavedShoppingList, "id" | "name" | "items" | "created_at">[]> {
  "use cache";
  cacheTag(`shopping-lists-${userId}`);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("shopping_lists")
    .select("id, name, items, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Pick<SavedShoppingList, "id" | "name" | "items" | "created_at">[];
}

export async function fetchShoppingList(
  id: string,
  userId: string,
): Promise<SavedShoppingList | null> {
  "use cache";
  cacheTag(`shopping-list-${id}`);
  cacheTag(`shopping-lists-${userId}`);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return data as SavedShoppingList | null;
}
