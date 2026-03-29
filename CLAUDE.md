# CLAUDE.md

This file documents the project for Claude Code. **Keep it up to date as the app changes** — update it whenever new features are added, dependencies change, or architectural decisions are made.

---

## Project Overview

A recipe collection web app. Users paste a recipe URL (including Instagram/Facebook Reels), the app scrapes its ingredients and instructions, and saves it to their personal collection. Selected recipes can generate a combined shopping list with quantities merged and converted to metric. Shopping lists can be named, saved, and managed.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Auth + Database**: Supabase (Postgres + Row Level Security)
- **Recipe Scraping**: Cheerio — parses `schema.org/Recipe` JSON-LD from recipe page HTML; Instagram/Facebook Reels via `yt-dlp` + Gemini
- **Ingredient Parsing**: `fraction.js` for fractional quantities; custom imperial→metric converter
- **AI**: Google Gemini 2.5 Flash (`@google/genai`) — extracts recipe data from Instagram/Facebook captions

## Project Structure

```text
app/
  page.tsx                        # Redirects → /recipes or /login
  layout.tsx                      # Root layout
  globals.css                     # Tailwind base styles + system font stack
  login/page.tsx                  # Login page
  auth/callback/route.ts          # OAuth callback handler
  recipes/
    page.tsx                      # Server component — fetches recipes, renders RecipesClient
    [id]/page.tsx                 # Recipe detail page
  shopping-list/page.tsx          # Active shopping list (reads selected IDs from sessionStorage)
  shopping-lists/
    page.tsx                      # Server component — lists all saved shopping lists
    [id]/page.tsx                 # Server component — loads a saved list, renders SavedShoppingListView
  api/
    scrape-recipe/route.ts        # POST — scrapes URL or Instagram/Facebook reel

components/
  atoms/
    Badge.tsx                     # Small label chip
    Button.tsx                    # Primary/secondary/ghost/danger variants
    Input.tsx                     # Text input with optional leading icon
    RoundCheckbox.tsx             # Circular checkbox used in shopping lists
    Spinner.tsx                   # Loading spinner
  molecules/
    FormField.tsx                 # Labelled input wrapper
    RecipeScrapedPreview.tsx      # Preview card shown before saving a scraped recipe
    ViewToggle.tsx                # Grid / list toggle
  organisms/
    AddRecipeForm.tsx             # URL input → scrape preview → save
    LoginForm.tsx                 # Email/password + Google OAuth form
    Navbar.tsx                    # Top nav with shopping list CTA, saved lists link, sign out
    RecipeCard.tsx                # Card with checkbox (grid view)
    RecipeRow.tsx                 # Row with checkbox (list view)
    SavedShoppingListView.tsx     # Client component — view/edit/delete a saved shopping list
    ShoppingList.tsx              # Client component — active shopping list with save, check, custom items
  templates/
    RecipesClient.tsx             # Client component — owns selection state, view toggle

lib/
  types.ts                        # Shared TypeScript interfaces
  utils.ts                        # cn() helper (clsx + tailwind-merge)
  ingredient-parser.ts            # parseIngredient(), buildShoppingList(), formatShoppingItem()
  instagram.ts                    # yt-dlp + Gemini scraper for Instagram/Facebook Reels
  recipe-scraper.ts               # HTML scraper — fetches URL, extracts schema.org/Recipe JSON-LD
  scrape-cache.ts                 # Supabase-backed cache for social media URL scrapes
  supabase/
    client.ts                     # Browser Supabase client
    server.ts                     # Server Supabase client (cookies)
    middleware.ts                 # Session refresh logic used by proxy.ts

scripts/
  download-yt-dlp.mjs             # Downloads yt-dlp standalone Linux binary at build time (Vercel)

supabase/
  schema.sql                      # Full DB schema + RLS policies

proxy.ts                          # Next.js middleware — session refresh for all routes
```

## Database

### `recipes`

| column       | type        | notes                                |
| ------------ | ----------- | ------------------------------------ |
| id           | uuid PK     | `gen_random_uuid()`                  |
| user_id      | uuid FK     | → `auth.users.id`, on delete cascade |
| title        | text        |                                      |
| source_url   | text        |                                      |
| image_url    | text        | nullable                             |
| ingredients  | jsonb       | `Ingredient[]`                       |
| instructions | jsonb       | `string[]`                           |
| created_at   | timestamptz | `now()`                              |

RLS policies restrict all operations to `auth.uid() = user_id`.

### `scrape_cache`

| column     | type        | notes           |
| ---------- | ----------- | --------------- |
| url        | text PK     |                 |
| recipe     | jsonb       | `ScrapedRecipe` |
| created_at | timestamptz | `now()`         |

RLS **disabled** — shared cache, no user-specific data.

### `shopping_lists`

| column     | type        | notes                                |
| ---------- | ----------- | ------------------------------------ |
| id         | uuid PK     | `gen_random_uuid()`                  |
| user_id    | uuid FK     | → `auth.users.id`, on delete cascade |
| name       | text        |                                      |
| items      | jsonb       | `SavedListItem[]`                    |
| recipe_ids | jsonb       | `string[]`                           |
| created_at | timestamptz | `now()`                              |

RLS policies restrict all operations to `auth.uid() = user_id`.

## Key Behaviours

### Instagram/Facebook Reels Scraping (`lib/instagram.ts`)

- Detected when URL hostname is `instagram.com`, `facebook.com`, `m.facebook.com`, or `fb.watch`
- Uses `yt-dlp` to fetch post metadata and caption (no video download)
- On Linux (Vercel): uses standalone binary at `bin/yt-dlp` downloaded by `scripts/download-yt-dlp.mjs` during `postinstall`; on macOS: uses system `yt-dlp` (`brew install yt-dlp`)
- Passes caption to Gemini 2.5 Flash to extract structured recipe data
- **Caption URL fallback**: if Gemini finds no recipe in the caption, extracts URLs from the caption and tries the HTML scraper on each (handles "recipe in my blog" posts)
- Results cached in `scrape_cache` table — subsequent requests for the same URL skip Gemini entirely
- Requires `GEMINI_API_KEY` env var; optional `YT_DLP_PATH` to override binary location

### Recipe Scraping (`lib/recipe-scraper.ts`)

- Fetches the URL server-side with a browser User-Agent
- Searches all `<script type="application/ld+json">` blocks for `@type: "Recipe"`
- Handles direct, `@graph`, and array-wrapped schema forms
- Falls back to `<h1>` for title if schema name is missing
- Returns a `ScrapedRecipe` — user reviews it before saving

### Ingredient Parsing (`lib/ingredient-parser.ts`)

- **Imperial → metric** at parse time:
  - Cooking volumes (`tsp`, `tbsp`, `cup`) — kept as-is (used for solids and liquids)
  - Liquid-only volumes (`pint`, `quart`, `gallon`, `fl oz`) → ml/l
  - Weight: `oz` → g, `lb` → g/kg
  - Values ≥1000ml → litres; values ≥1000g → kg
- Handles unicode fractions (½, ¾, etc.) and mixed numbers ("1 1/2")
- Strips noise adjectives ("fresh", "chopped", etc.) for ingredient name normalisation

### Shopping List (`components/organisms/ShoppingList.tsx`)

- Selected recipe IDs stored in `sessionStorage` under `selected_recipe_ids`
- `buildShoppingList()` groups by normalised ingredient name, sums quantities per unit
- Items sorted alphabetically
- Each item has a checkbox — tick to strike through
- Custom items can be added (text input + Enter/Add button); custom items can be removed
- List can be named (editable inline in header)
- **Save**: inserts into `shopping_lists` table; subsequent saves update the same record
- **Copy**: copies plain text (`- quantity unit name` per line) to clipboard

### Saved Shopping Lists

- `/shopping-lists` — lists all saved lists with item count, checked progress, and date
- `/shopping-lists/[id]` — full editable view: check/uncheck, add/remove custom items, rename, save, delete

### Auth

- Email/password and Google OAuth via Supabase Auth
- `proxy.ts` (Next.js middleware) refreshes sessions on all routes
- Supabase client always instantiated lazily (inside handlers/effects) to avoid build-time errors
- For Google OAuth on localhost: add `http://localhost:3000/auth/callback` to Supabase **Redirect URLs** allowlist

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

## Local Development

```bash
npm install       # also runs postinstall (skipped on non-Linux)
npm run dev       # http://localhost:3000
npm run build     # production build check
npm run typecheck # tsc --noEmit
```

## Supabase Setup

1. Create a project at supabase.com

2. Run `supabase/schema.sql` in the SQL editor
3. Enable Google OAuth: Auth → Providers → Google (add Client ID + Secret)
4. Add `http://localhost:3000/auth/callback` to Auth → URL Configuration → Redirect URLs

## Deployment (Vercel)

- `postinstall` downloads
 the `yt-dlp_linux` standalone binary to `bin/yt-dlp` (Python bundled — no system Python needed)
- `outputFileTracingIncludes` in `next.config.ts` bundles `bin/yt-dlp` into the `/api/scrape-recipe` function
- Set `GEMINI_API_KEY` in Vercel environment variables
