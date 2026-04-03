"use client";

import { Plus, Trash2 } from "lucide-react";

import { parseIngredient } from "@/lib/ingredient-parser";
import type { Ingredient } from "@/lib/types";

export interface IngredientRow {
  id: string;
  quantity: string;
  unit: string;
  name: string;
}

interface IngredientEditorProps {
  value: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
}

export function rowsToIngredients(rows: IngredientRow[]): Ingredient[] {
  return rows
    .filter((row) => row.name.trim())
    .map((row) => {
      const raw = [row.quantity.trim(), row.unit.trim(), row.name.trim()]
        .filter(Boolean)
        .join(" ");
      return parseIngredient(raw);
    });
}

function newRow(): IngredientRow {
  return { id: crypto.randomUUID(), quantity: "", unit: "", name: "" };
}

export function ingredientsToRows(ingredients: Ingredient[]): IngredientRow[] {
  if (!ingredients.length) return [newRow()];
  return ingredients.map((ing) => ({
    id: crypto.randomUUID(),
    quantity: ing.quantity !== null ? String(ing.quantity) : "",
    unit: ing.unit ?? "",
    name: ing.name,
  }));
}

export const IngredientEditor = ({ value, onChange }: IngredientEditorProps) => {
  function update(id: string, field: keyof Omit<IngredientRow, "id">, val: string) {
    onChange(value.map((row) => (row.id === id ? { ...row, [field]: val } : row)));
  }

  function add() {
    onChange([...value, newRow()]);
  }

  function remove(id: string) {
    const next = value.filter((row) => row.id !== id);
    onChange(next.length ? next : [newRow()]);
  }

  return (
    <div className="space-y-2">
      {value.map((row, idx) => (
        <div key={row.id} className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="decimal"
            value={row.quantity}
            onChange={(e) => update(row.id, "quantity", e.target.value)}
            placeholder="Qty"
            aria-label={`Ingredient ${idx + 1} quantity`}
            className="w-12 sm:w-16 px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <input
            type="text"
            value={row.unit}
            onChange={(e) => update(row.id, "unit", e.target.value)}
            placeholder="Unit"
            aria-label={`Ingredient ${idx + 1} unit`}
            className="w-14 sm:w-20 px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <input
            type="text"
            value={row.name}
            onChange={(e) => update(row.id, "name", e.target.value)}
            placeholder="Ingredient name"
            aria-label={`Ingredient ${idx + 1} name`}
            className="min-w-0 flex-1 px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="p-1.5 text-stone-400 hover:text-red-500 transition flex-shrink-0"
            title="Remove ingredient"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium mt-1"
      >
        <Plus size={14} />
        Add ingredient
      </button>
    </div>
  );
}
