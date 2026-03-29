"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Link as LinkIcon, Check, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ScrapedRecipe } from "@/lib/types";

interface AddRecipeFormProps {
  onAdded: () => void;
}

type Step = "idle" | "loading" | "preview" | "saving";

export function AddRecipeForm({ onAdded }: AddRecipeFormProps) {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [scraped, setScraped] = useState<ScrapedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/scrape-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch recipe");
        setStep("idle");
        return;
      }
      setScraped(data.recipe);
      setStep("preview");
    } catch {
      setError("Network error. Please try again.");
      setStep("idle");
    }
  }

  async function handleSave() {
    if (!scraped) return;
    setStep("saving");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: dbError } = await supabase.from("recipes").insert({
      user_id: user.id,
      title: scraped.title,
      source_url: scraped.source_url,
      image_url: scraped.image_url,
      ingredients: scraped.ingredients,
      instructions: scraped.instructions,
    });

    if (dbError) {
      setError(dbError.message);
      setStep("preview");
      return;
    }

    setUrl("");
    setScraped(null);
    setStep("idle");
    onAdded();
  }

  function handleCancel() {
    setScraped(null);
    setStep("idle");
    setError(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleFetch} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition">
          <LinkIcon size={16} className="text-stone-400 flex-shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a recipe URL…"
            className="flex-1 text-sm outline-none bg-transparent"
            disabled={step === "loading" || step === "saving"}
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || step === "loading" || step === "saving"}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          {step === "loading" ? "Fetching…" : "Add"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {(step === "preview" || step === "saving") && scraped && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="flex gap-4 p-4">
            {scraped.image_url && (
              <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={scraped.image_url}
                  alt={scraped.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900">{scraped.title}</h3>
              <p className="text-sm text-stone-500 mt-0.5">
                {scraped.ingredients.length} ingredients · {scraped.instructions.length} steps
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {scraped.ingredients.slice(0, 5).map((ing, i) => (
                  <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {ing.name}
                  </span>
                ))}
                {scraped.ingredients.length > 5 && (
                  <span className="text-xs text-stone-400">+{scraped.ingredients.length - 5} more</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 pb-4">
            <button
              onClick={handleSave}
              disabled={step === "saving"}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              {step === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {step === "saving" ? "Saving…" : "Save recipe"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm px-3 py-2 rounded-xl hover:bg-stone-100 transition"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
