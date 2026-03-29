import { X } from "lucide-react";

import { RoundCheckbox } from "@/components/atoms/RoundCheckbox";

interface ListEntry {
  id: string;
  label: string;
  checked: boolean;
  custom: boolean;
}

interface ShoppingListEntriesProps {
  entries: ListEntry[];
  toggleEntry: (id: string) => void;
  removeEntry: (id: string) => void;
}

export const ShoppingListEntries = ({
  entries,
  toggleEntry,
  removeEntry,
}: ShoppingListEntriesProps) => {
  return (
    <div className="divide-y divide-stone-100">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center px-4 py-3 gap-3">
          <RoundCheckbox
            size="sm"
            checked={entry.checked}
            onChange={() => toggleEntry(entry.id)}
          />
          <span
            className={`flex-1 text-sm capitalize ${entry.checked ? "line-through text-stone-400" : "text-stone-800"}`}
          >
            {entry.label}
          </span>
          {entry.custom && (
            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              className="text-stone-300 hover:text-stone-500 transition flex-shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
