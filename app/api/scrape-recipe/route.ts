import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { parseIngredient } from "@/lib/ingredient-parser";
import { scrapeInstagramReel, isInstagramUrl } from "@/lib/instagram";
import type { ScrapedRecipe } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    // Instagram Reels — use yt-dlp + Gemini instead of HTML scraping
    if (isInstagramUrl(url)) {
      const recipe = await scrapeInstagramReel(url);
      return NextResponse.json({ recipe });
    }

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
      return NextResponse.json(
        { error: `Failed to fetch page (HTTP ${response.status})` },
        { status: 422 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract all JSON-LD blocks
    const jsonLdBlocks: object[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        jsonLdBlocks.push(data);
      } catch {
        // skip invalid JSON
      }
    });

    // Find Recipe schema (handles direct, @graph, and array forms)
    const recipeSchema = findRecipeSchema(jsonLdBlocks);

    if (!recipeSchema) {
      return NextResponse.json(
        { error: "No recipe data found on this page. Make sure the URL points to a single recipe." },
        { status: 422 }
      );
    }

    const title = extractString(recipeSchema.name) || $("h1").first().text().trim() || "Untitled Recipe";

    const imageUrl = extractImageUrl(recipeSchema.image);

    const rawIngredients: string[] = Array.isArray(recipeSchema.recipeIngredient)
      ? recipeSchema.recipeIngredient.map((i: unknown) => String(i))
      : [];

    const instructions = extractInstructions(recipeSchema.recipeInstructions);

    const ingredients = rawIngredients.map((raw) => parseIngredient(raw));

    const recipe: ScrapedRecipe = {
      title,
      source_url: url,
      image_url: imageUrl,
      ingredients,
      instructions,
    };

    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: "Failed to scrape recipe" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRecipeSchema(blocks: any[]): any | null {
  for (const block of blocks) {
    if (!block) continue;

    // Direct Recipe
    if (block["@type"] === "Recipe") return block;

    // Array of types
    if (Array.isArray(block["@type"]) && block["@type"].includes("Recipe")) return block;

    // @graph array
    if (Array.isArray(block["@graph"])) {
      const found = findRecipeSchema(block["@graph"]);
      if (found) return found;
    }

    // Array of schemas
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
    return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string") return [item.trim()].filter(Boolean);
      if (item && typeof item === "object") {
        // HowToStep
        if (item["@type"] === "HowToStep" || item["@type"] === "HowToSection") {
          if (item["@type"] === "HowToSection" && Array.isArray(item.itemListElement)) {
            return extractInstructions(item.itemListElement);
          }
          return [extractString(item.text) || ""].filter(Boolean);
        }
        return [extractString(item.text) || extractString(item.name) || ""].filter(Boolean);
      }
      return [];
    });
  }

  return [];
}
