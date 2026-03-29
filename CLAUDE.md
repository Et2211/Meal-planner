# CLAUDE.md

This file documents the project for Claude Code. **Keep it up to date as the app changes** — update it whenever new features are added, dependencies change, or architectural decisions are made.

---

## Project Overview

A recipe collection web app. Users paste a recipe URL, the app scrapes its ingredients and instructions, and saves it to their personal collection. Selected recipes can generate a combined shopping list with quantities merged and converted to metric.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Auth + Database**: Supabase (Postgres + Row Level Security)
- **Recipe Scraping**: Cheerio — parses `schema.org/Recipe` JSON-LD from recipe page HTML
- **Ingredient Parsing**: `fraction.js` for fractional quantities; custom imperial→metric converter

## Project Structure

```
app/
  page.tsx                  # Redirects → /recipes or /login
  layout.tsx                # Root layout
  globals.css               # Tailwind base styles + system font stack
  login/page.tsx            # Login page
  auth/callback/route.ts    # OAuth callback handler
  recipes/
    page.tsx                # Server component — fetches recipes, renders RecipesClient
    [id]/page.tsx           # Recipe detail page
  shopping-list/page.tsx    # Shopping list page (reads selected IDs from sessionStorage)
  api/
    scrape-recipe/route.ts  # POST — fetches URL, extracts schema.org/Recipe JSON-LD

components/
  LoginForm.tsx             # Email/password + Google OAuth form
  Navbar.tsx                # Top nav with shopping list CTA and sign out
  AddRecipeForm.tsx         # URL input → scrape preview → save
  RecipeCard.tsx            # Card with checkbox (grid view)
  RecipeRow.tsx             # Row with checkbox (list view)
  RecipesClient.tsx         # Client component — owns selection state, view toggle
  ViewToggle.tsx            # Grid / list toggle
  ShoppingList.tsx          # Renders merged shopping list, copy to clipboard

lib/
  types.ts                  # Shared TypeScript interfaces (Recipe, Ingredient, etc.)
  utils.ts                  # cn() helper (clsx + tailwind-merge)
  ingredient-parser.ts      # parseIngredient(), buildShoppingList(), formatShoppingItem()
  supabase/
    client.ts               # Browser Supabase client
    server.ts               # Server Supabase client (cookies)
    middleware.ts           # Session refresh logic used by proxy.ts

supabase/
  schema.sql                # recipes table definition + RLS policies

proxy.ts                    # Next.js 16 route proxy — protects /recipes and /shopping-list
```

## Database

Single table: `recipes`

| column       | type        | notes                          |
|---|---|---|
| id           | uuid PK     | `gen_random_uuid()`            |
| user_id      | uuid FK     | → `auth.users.id`, on delete cascade |
| title        | text        |                                |
| source_url   | text        |                                |
| image_url    | text        | nullable                       |
| ingredients  | jsonb       | `Ingredient[]`                 |
| instructions | jsonb       | `string[]`                     |
| created_at   | timestamptz | `now()`                        |

RLS policies restrict all operations to `auth.uid() = user_id`.

## Key Behaviours

### Recipe Scraping
- Fetches the URL server-side with a browser User-Agent
- Searches all `<script type="application/ld+json">` blocks for `@type: "Recipe"`
- Handles direct, `@graph`, and array-wrapped schema forms
- Falls back to `<h1>` for title if schema name is missing
- Returns a `ScrapedRecipe` — user reviews it before saving

### Ingredient Parsing (`lib/ingredient-parser.ts`)
- Converts **imperial → metric** at parse time:
  - Volume: tsp→5ml, tbsp→15ml, cup→240ml, pint→473ml, quart→946ml
  - Weight: oz→28g, lb→454g
  - Values ≥1000ml become litres; values ≥1000g become kg
- Handles unicode fractions (½, ¾, etc.) and mixed numbers ("1 1/2")
- Strips noise adjectives ("fresh", "chopped", etc.) for ingredient name normalisation

### Shopping List
- Selected recipe IDs are stored in `sessionStorage` under `selected_recipe_ids`
- `buildShoppingList()` groups by normalised ingredient name, sums quantities per unit
- Items sorted alphabetically
- "Copy to clipboard" produces plain text: one `- quantity unit name` per line

### Auth
- Email/password and Google OAuth via Supabase Auth
- `proxy.ts` redirects unauthenticated users to `/login`
- Supabase client is always instantiated lazily (inside handlers/effects) to avoid build-time errors

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key
```

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build check
```

## Supabase Setup

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Enable Google OAuth: Auth → Providers → Google (add Client ID + Secret)
4. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs
