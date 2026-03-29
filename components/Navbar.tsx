"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, ShoppingCart, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  selectedCount: number;
  onShoppingListClick?: () => void;
}

export function Navbar({ selectedCount, onShoppingListClick }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/recipes" className="flex items-center gap-2 font-semibold text-stone-900">
          <ChefHat size={22} className="text-brand-500" />
          Recipe Collection
        </Link>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Link
              href="/shopping-list"
              onClick={onShoppingListClick}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
            >
              <ShoppingCart size={15} />
              Shopping list
              <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded">
                {selectedCount}
              </span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
