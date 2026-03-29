import { redirect } from "next/navigation";

import { ShoppingList } from "@/components/organisms/ShoppingList";
import { createClient } from "@/lib/supabase/server";

export default async function ShoppingListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ShoppingList />;
}
