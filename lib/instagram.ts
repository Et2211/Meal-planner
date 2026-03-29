import { execFile } from "child_process";
import { promisify } from "util";
import { GoogleGenAI } from "@google/genai";
import { parseIngredient } from "./ingredient-parser";
import { getCachedScrape, setCachedScrape } from "./scrape-cache";
import type { ScrapedRecipe } from "./types";

const execFileAsync = promisify(execFile);

interface YtDlpMeta {
  title?: string;
  description?: string;
  thumbnail?: string;
}

async function fetchInstagramMeta(url: string): Promise<YtDlpMeta> {
  const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp";
  const { stdout } = await execFileAsync(
    ytDlpPath,
    ["--dump-json", "--no-playlist", "--no-warnings", url],
    { timeout: 30000 }
  );
  return JSON.parse(stdout) as YtDlpMeta;
}

interface GeminiRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

async function parseRecipeWithGemini(
  caption: string,
  fallbackTitle: string
): Promise<GeminiRecipe> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Extract recipe information from this Instagram post caption.

Return ONLY a JSON object with exactly these fields:
{
  "title": "Recipe name (short, descriptive)",
  "ingredients": ["quantity unit ingredient", ...],
  "instructions": ["Step 1...", "Step 2...", ...]
}

If the caption does not contain a recipe, return:
{"error": "No recipe found"}

Caption:
${caption}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text ?? "";

  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(json);

  if ("error" in parsed) {
    throw new Error(parsed.error as string);
  }

  return {
    title: parsed.title || fallbackTitle,
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
  };
}

export async function scrapeInstagramReel(url: string): Promise<ScrapedRecipe> {
  const cached = await getCachedScrape(url);
  if (cached) return cached;

  const meta = await fetchInstagramMeta(url);

  const caption = meta.description || "";
  const fallbackTitle = meta.title || "Instagram Recipe";

  if (!caption.trim()) {
    throw new Error("This post has no caption. Cannot extract a recipe.");
  }

  const recipe = await parseRecipeWithGemini(caption, fallbackTitle);

  const scraped: ScrapedRecipe = {
    title: recipe.title,
    source_url: url,
    image_url: meta.thumbnail ?? null,
    ingredients: recipe.ingredients.map((raw) => parseIngredient(raw)),
    instructions: recipe.instructions,
  };

  await setCachedScrape(url, scraped);
  return scraped;
}

export function isInstagramUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "instagram.com" || hostname === "www.instagram.com";
  } catch {
    return false;
  }
}

export function isFacebookUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "facebook.com" ||
      hostname === "www.facebook.com" ||
      hostname === "m.facebook.com" ||
      hostname === "fb.watch"
    );
  } catch {
    return false;
  }
}
