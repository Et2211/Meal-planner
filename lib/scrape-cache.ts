import { createClient } from "./supabase/server";
import type { ScrapedRecipe } from "./types";

export async function getCachedScrape(url: string): Promise<ScrapedRecipe | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scrape_cache")
    .select("recipe")
    .eq("url", url)
    .single();
  return (data?.recipe as ScrapedRecipe) ?? null;
}

export async function setCachedScrape(url: string, recipe: ScrapedRecipe): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scrape_cache")
    .upsert({ url, recipe });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("scrape_cache write failed:", error.message);
  }
}
