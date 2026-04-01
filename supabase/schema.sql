-- Recipe Collection App — Supabase Schema
-- Run this in your Supabase SQL editor

create table if not exists public.recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  source_url  text not null,
  image_url   text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);

-- Enable Row Level Security
alter table public.recipes enable row level security;

-- Policies: users can only access their own recipes
create policy "Users can view own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Scrape cache: shared cache for social media URL scrapes
-- RLS enabled — authenticated users can read/write; no delete policy (rows are permanent)
create table if not exists public.scrape_cache (
  url        text primary key,
  recipe     jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.scrape_cache enable row level security;

create policy "Authenticated users can read scrape cache"
  on public.scrape_cache for select
  to authenticated
  using (true);

create policy "Authenticated users can write scrape cache"
  on public.scrape_cache for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update scrape cache"
  on public.scrape_cache for update
  to authenticated
  using (true);

-- Shopping lists: named, saveable lists with checked state and custom items
create table if not exists public.shopping_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  items       jsonb not null default '[]'::jsonb,
  recipe_ids  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists shopping_lists_user_id_idx on public.shopping_lists(user_id);

alter table public.shopping_lists enable row level security;

create policy "Users can view own shopping lists"
  on public.shopping_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping lists"
  on public.shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shopping lists"
  on public.shopping_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own shopping lists"
  on public.shopping_lists for delete
  using (auth.uid() = user_id);
