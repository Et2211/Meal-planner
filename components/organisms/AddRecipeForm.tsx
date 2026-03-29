"use client";

import { Link as LinkIcon, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { RecipeScrapedPreview } from "@/components/molecules/RecipeScrapedPreview";
import { createClient } from "@/lib/supabase/client";
import type { ScrapedRecipe } from "@/lib/types";

interface AddRecipeFormProps {
  onAdded: () => void;
}

type Step = "idle" | "loading" | "preview" | "saving";

export const AddRecipeForm = ({ onAdded }: AddRecipeFormProps) => {
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

  const isBusy = step === "loading" || step === "saving";

  return (
    <div className="space-y-4">
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
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
