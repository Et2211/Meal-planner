import { createClient } from "@supabase/supabase-js";
import type { ScrapedRecipe } from "./types";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}

export async function getCachedScrape(url: string): Promise<ScrapedRecipe | null> {
  const { data } = await getClient()
    .from("scrape_cache")
    .select("recipe")
    .eq("url", url)
    .single();
  return (data?.recipe as ScrapedRecipe) ?? null;
}

export async function setCachedScrape(url: string, recipe: ScrapedRecipe): Promise<void> {
  await getClient()
    .from("scrape_cache")
    .upsert({ url, recipe });
}
