"use client";

import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface QuickAddButtonProps {
  sourceUrl: string;
}

type State = "idle" | "loading" | "saved" | "error";

export const QuickAddButton = ({ sourceUrl }: QuickAddButtonProps) => {
  const [state, setState] = useState<State>("idle");

  async function handleAdd() {
    setState("loading");

    try {
      const res = await fetch("/api/scrape-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setState("error"); return; }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("error"); return; }

      const { error } = await supabase.from("recipes").insert({
        user_id: user.id,
        title: data.recipe.title,
        source_url: data.recipe.source_url,
        image_url: data.recipe.image_url,
        ingredients: data.recipe.ingredients,
        instructions: data.recipe.instructions,
      });

      setState(error ? "error" : "saved");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <Check size={13} /> Saved
      </span>
    );
  }

  if (state === "error") {
    return <span className="text-xs text-red-500">Failed</span>;
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={state === "loading"}
      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 transition flex-shrink-0"
    >
      {state === "loading" ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
      {state === "loading" ? "Adding…" : "Add"}
    </button>
  );
};
