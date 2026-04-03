"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import {
  IngredientEditor,
  ingredientsToRows,
  rowsToIngredients,
  type IngredientRow,
} from "@/components/molecules/IngredientEditor";
import { FormField } from "@/components/molecules/FormField";
import type { Ingredient } from "@/lib/types";

export interface RecipePayload {
  title: string;
  source_url: null;
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
}

interface RecipeEditorProps {
  initial?: {
    title: string;
    image_url: string | null;
    ingredients: Ingredient[];
    instructions: string[];
  };
  onSave: (data: RecipePayload) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function RecipeEditor({ initial, onSave, onCancel, isSaving }: RecipeEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(() =>
    ingredientsToRows(initial?.ingredients ?? [])
  );
  const [instructions, setInstructions] = useState<string[]>(
    initial?.instructions?.length ? initial.instructions : [""]
  );

  function updateInstruction(idx: number, val: string) {
    setInstructions((prev) => prev.map((s, i) => (i === idx ? val : s)));
  }

  function addInstruction() {
    setInstructions((prev) => [...prev, ""]);
  }

  function removeInstruction(idx: number) {
    setInstructions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [""];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      title: title.trim(),
      source_url: null,
      image_url: imageUrl.trim() || null,
      ingredients: rowsToIngredients(ingredientRows),
      instructions: instructions.map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My favourite pasta"
        required
      />

      <FormField
        label="Image URL (optional)"
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://…"
      />

      <div>
        <p className="block text-sm font-medium text-stone-700 mb-2">
          Ingredients
        </p>
        <div className="text-xs text-stone-400 mb-2 break-words">
          Quantities are converted to metric automatically (e.g. 1 cup → 240 ml)
        </div>
        <IngredientEditor value={ingredientRows} onChange={setIngredientRows} />
      </div>

      <div>
        <p className="block text-sm font-medium text-stone-700 mb-2">
          Instructions
        </p>
        <div className="space-y-2">
          {instructions.map((step, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center mt-2">
                {idx + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                placeholder={`Step ${idx + 1}…`}
                rows={2}
                aria-label={`Step ${idx + 1}`}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
              <button
                type="button"
                onClick={() => removeInstruction(idx)}
                className="p-1.5 text-stone-400 hover:text-red-500 transition flex-shrink-0 mt-1"
                title="Remove step"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus size={14} />
            Add step
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={!title.trim() || isSaving}>
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          {isSaving ? "Saving…" : "Save recipe"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
