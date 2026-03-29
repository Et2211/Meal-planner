"use client";

import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "p-1.5 rounded-md transition",
          view === "grid"
            ? "bg-white shadow-sm text-stone-900"
            : "text-stone-500 hover:text-stone-700"
        )}
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "p-1.5 rounded-md transition",
          view === "list"
            ? "bg-white shadow-sm text-stone-900"
            : "text-stone-500 hover:text-stone-700"
        )}
        title="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}
