"use client";

import { Link as LinkIcon, Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { RecipeScrapedPreview } from "@/components/molecules/RecipeScrapedPreview";
import { RecipeEditor, type RecipePayload } from "@/components/organisms/RecipeEditor";
import { revalidateUserRecipes } from "@/lib/actions/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { ScrapedRecipe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddRecipeFormProps {
  onAdded: () => void;
}

type Step = "idle" | "loading" | "preview" | "saving";
type Mode = "url" | "custom";

export const AddRecipeForm = ({ onAdded }: AddRecipeFormProps) => {
  const [mode, setMode] = useState<Mode>("url");

  // URL scrape state
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [scraped, setScraped] = useState<ScrapedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Custom recipe state
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

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

  async function handleSaveScraped() {
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

    await revalidateUserRecipes(user.id);
    setUrl("");
    setScraped(null);
    setStep("idle");
    onAdded();
  }

  async function handleSaveCustom(payload: RecipePayload) {
    setIsSavingCustom(true);
    setCustomError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSavingCustom(false); return; }

    const { error: dbError } = await supabase.from("recipes").insert({
      user_id: user.id,
      ...payload,
    });

    if (dbError) {
      setCustomError(dbError.message);
      setIsSavingCustom(false);
      return;
    }

    await revalidateUserRecipes(user.id);
    setIsSavingCustom(false);
    setMode("url");
    onAdded();
  }

  function handleCancelScrape() {
    setScraped(null);
    setStep("idle");
    setError(null);
  }

  const isBusy = step === "loading" || step === "saving";

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition",
            mode === "url"
              ? "bg-white shadow-sm text-stone-900"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          <LinkIcon size={14} />
          From URL
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition",
            mode === "custom"
              ? "bg-white shadow-sm text-stone-900"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          <Pencil size={14} />
          Write your own
        </button>
      </div>

      {/* URL mode */}
      {mode === "url" && (
        <>
          <form onSubmit={handleFetch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a recipe URL…"
                disabled={isBusy}
                leadingIcon={<LinkIcon size={16} />}
              />
            </div>
            <Button type="submit" disabled={!url.trim() || isBusy}>
              {step === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              {step === "loading" ? "Fetching…" : "Add"}
            </Button>
          </form>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {(step === "preview" || step === "saving") && scraped && (
            <RecipeScrapedPreview
              recipe={scraped}
              isSaving={step === "saving"}
              onSave={handleSaveScraped}
              onCancel={handleCancelScrape}
            />
          )}
        </>
      )}

      {/* Custom recipe mode */}
      {mode === "custom" && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          {customError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{customError}</p>
          )}
          <RecipeEditor
            isSaving={isSavingCustom}
            onSave={handleSaveCustom}
            onCancel={() => setMode("url")}
          />
        </div>
      )}
    </div>
  );
};
