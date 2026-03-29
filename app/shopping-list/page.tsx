import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShoppingList } from "@/components/ShoppingList";

export default async function ShoppingListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ShoppingList />;
}
