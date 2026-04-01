"use client";


import { ArrowLeft, Check, ClipboardList, Copy, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { RoundCheckbox } from "@/components/atoms/RoundCheckbox";
import { Spinner } from "@/components/atoms/Spinner";
import { revalidateShoppingList, revalidateUserShoppingLists } from "@/lib/actions/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { SavedListItem, SavedShoppingList } from "@/lib/types";

interface Props {
  list: SavedShoppingList;
}

export const SavedShoppingListView = ({ list }: Props) => {
  const router = useRouter();
  const [listName, setListName] = useState(list.name);
  const [items, setItems] = useState<SavedListItem[]>(list.items);
  const [customInput, setCustomInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toggleItem(index: number) {
    setItems((prev) => prev.map((item, idx) => idx === index ? { ...item, checked: !item.checked } : item));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  function addCustomItem() {
    const label = customInput.trim();
    if (!label) return;
    setItems((prev) => [...prev, { label, checked: false, custom: true }]);
    setCustomInput("");
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("shopping_lists").update({ name: listName, items }).eq("id", list.id);
    if (user) await revalidateShoppingList(list.id, user.id);
    setSaving(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${listName}"?`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("shopping_lists").delete().eq("id", list.id);
    if (user) await revalidateUserShoppingLists(user.id);
    router.push("/shopping-lists");
  }

  async function handleCopy() {
    const text = items.map((item) => `${item.checked ? "✓" : "-"} ${item.label}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/shopping-lists"
            className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <ClipboardList size={18} className="text-brand-500 flex-shrink-0" />
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="flex-1 min-w-0 font-semibold text-stone-900 bg-transparent outline-none truncate focus:bg-stone-50 focus:px-2 rounded-lg transition-all"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saveFeedback ? <><Check size={14} /> Saved!</> : saving ? <Spinner size="sm" /> : <><Save size={14} /> Save</>}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-stone-100">
            {items.map((item, index) => (
              <div key={index} className="flex items-center px-4 py-3 gap-3">
                <RoundCheckbox
                  size="sm"
                  checked={item.checked}
                  onChange={() => toggleItem(index)}
                />
                <span className={`flex-1 text-sm capitalize ${item.checked ? "line-through text-stone-400" : "text-stone-800"}`}>
                  {item.label}
                </span>
                {item.custom && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-stone-300 hover:text-stone-500 transition flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
            <Input
              placeholder="Add a custom item..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCustomItem(); }}
              className="flex-1"
            />
            <Button variant="secondary" size="sm" onClick={addCustomItem} disabled={!customInput.trim()}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" /> : <><Trash2 size={14} /> Delete list</>}
          </Button>
        </div>
      </main>
    </div>
  );
};
