import { ArrowLeft, Check, Copy, Save, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";

interface ShoppingListHeaderProps {
  listName: string;
  setListName: (v: string) => void;
  entriesLength: number;
  handleCopy: () => void;
  copied: boolean;
  handleSave: () => void;
  saving: boolean;
  saveFeedback: boolean;
}

export const ShoppingListHeader = ({
  listName,
  setListName,
  entriesLength,
  handleCopy,
  copied,
  handleSave,
  saving,
  saveFeedback,
}: ShoppingListHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href="/recipes"
          className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <ShoppingCart size={18} className="text-brand-500 flex-shrink-0" />
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="flex-1 min-w-0 font-semibold text-stone-900 bg-transparent outline-none truncate focus:bg-stone-50 focus:px-2 rounded-lg transition-all"
        />
        {entriesLength > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saveFeedback ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : saving ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Save size={14} /> Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
