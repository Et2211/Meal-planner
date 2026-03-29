import { NextResponse } from "next/server";

import { isFacebookUrl, isInstagramUrl, scrapeInstagramReel } from "@/lib/instagram";
import { scrapeRecipeFromUrl } from "@/lib/recipe-scraper";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    // Instagram/Facebook Reels — use yt-dlp + Gemini instead of HTML scraping
    if (isInstagramUrl(url) || isFacebookUrl(url)) {
      const recipe = await scrapeInstagramReel(url);
      return NextResponse.json({ recipe });
    }

    const recipe = await scrapeRecipeFromUrl(url);
    return NextResponse.json({ recipe });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Scrape error:", err);
    const message = err instanceof Error ? err.message : "Failed to scrape recipe";
    const isNotFound = message.includes("No recipe data found");
    return NextResponse.json({ error: isNotFound ? `${message} Make sure the URL points to a single recipe.` : message }, { status: isNotFound ? 422 : 500 });
  }
}
