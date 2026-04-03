"use client";

import {
  ChefHat,
  ClipboardList,
  LogOut,
  Menu,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  selectedCount: number;
  onShoppingListClick?: () => void;
}

export const Navbar = ({ selectedCount, onShoppingListClick }: NavbarProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/recipes"
          className="flex items-center gap-2 font-semibold text-stone-900"
          onClick={closeMenu}
        >
          <ChefHat size={22} className="text-brand-500" />
          Recipe Collection
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/top-rated"
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            title="Top rated recipes"
          >
            <Star size={18} />
          </Link>
          <Link
            href="/shopping-lists"
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            title="Saved shopping lists"
          >
            <ClipboardList size={18} />
          </Link>
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

        {/* Mobile: shopping list badge + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {selectedCount > 0 && (
            <Link
              href="/shopping-list"
              onClick={() => { onShoppingListClick?.(); closeMenu(); }}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-2.5 py-1.5 rounded-lg transition"
            >
              <ShoppingCart size={15} />
              <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded">
                {selectedCount}
              </span>
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu — always mounted, animated via grid-rows */}
      <div
        className={`sm:hidden grid transition-[grid-template-rows] duration-200 ease-in-out ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-stone-100 bg-white">
            <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
              <Link
                href="/top-rated"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 text-stone-700 hover:bg-stone-50 rounded-lg transition"
              >
                <Star size={18} className="text-stone-400" />
                Top rated
              </Link>
              <Link
                href="/shopping-lists"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 text-stone-700 hover:bg-stone-50 rounded-lg transition"
              >
                <ClipboardList size={18} className="text-stone-400" />
                Saved shopping lists
              </Link>
              <button
                onClick={() => { closeMenu(); handleSignOut(); }}
                className="flex items-center gap-3 px-3 py-3 text-stone-700 hover:bg-stone-50 rounded-lg transition text-left"
              >
                <LogOut size={18} className="text-stone-400" />
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
