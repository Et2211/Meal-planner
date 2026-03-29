import * as cheerio from "cheerio";

import { parseIngredient } from "./ingredient-parser";
import type { ScrapedRecipe } from "./types";

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page (HTTP cheerioDoc{response.status})`);
  }

  const html = await response.text();
  const cheerioDoc = cheerio.load(html);

  const jsonLdBlocks: object[] = [];
  cheerioDoc('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse(cheerioDoc(el).html() || "");
      jsonLdBlocks.push(data);
    } catch {
      // skip invalid JSON
    }
  });

  const recipeSchema = findRecipeSchema(jsonLdBlocks);

  if (!recipeSchema) {
    throw new Error("No recipe data found on this page.");
  }

  const title =
    extractString(recipeSchema.name) || cheerioDoc("h1").first().text().trim() || "Untitled Recipe";
  const imageUrl = extractImageUrl(recipeSchema.image);
  const rawIngredients: string[] = Array.isArray(recipeSchema.recipeIngredient)
    ? recipeSchema.recipeIngredient.map((ingredient: unknown) => String(ingredient))
    : [];
  const instructions = extractInstructions(recipeSchema.recipeInstructions);
  const ingredients = rawIngredients.map((raw) => parseIngredient(raw));

  return { title, source_url: url, image_url: imageUrl, ingredients, instructions };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRecipeSchema(blocks: any[]): any | null {
  for (const block of blocks) {
    if (!block) continue;
    if (block["@type"] === "Recipe") return block;
    if (Array.isArray(block["@type"]) && block["@type"].includes("Recipe")) return block;
    if (Array.isArray(block["@graph"])) {
      const found = findRecipeSchema(block["@graph"]);
      if (found) return found;
    }
    if (Array.isArray(block)) {
      const found = findRecipeSchema(block);
      if (found) return found;
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractString(val: any): string | null {
  if (typeof val === "string") return val.trim();
  if (val && typeof val === "object" && typeof val["@value"] === "string") return val["@value"].trim();
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(image: any): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return extractImageUrl(image[0]);
  if (typeof image === "object") {
    return extractString(image.url) || extractString(image.contentUrl) || null;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractInstructions(raw: any): string[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    return raw.split(/\n+/).map((step: string) => step.trim()).filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string") return [item.trim()].filter(Boolean);
      if (item && typeof item === "object") {
        if (item["@type"] === "HowToSection" && Array.isArray(item.itemListElement)) {
          return extractInstructions(item.itemListElement);
        }
        if (item["@type"] === "HowToStep" || item["@type"] === "HowToSection") {
          return [extractString(item.text) || ""].filter(Boolean);
        }
        return [extractString(item.text) || extractString(item.name) || ""].filter(Boolean);
      }
      return [];
    });
  }
  return [];
}
