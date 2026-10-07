-- ============================================================
-- LOVE PAGE — Supabase Setup SQL
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the love_pages table
create table if not exists public.love_pages (
  id          text        primary key default ('lp_' || gen_random_uuid()::text),
  slug        text        not null unique,
  title       text        not null,
  message     text        not null default '',
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Index for fast slug lookups (share links)
create index if not exists love_pages_slug_idx on public.love_pages (slug);

-- 3. Row Level Security — allow anyone to read, create, update, delete
--    (no login required — pages are publicly shareable)
alter table public.love_pages enable row level security;

create policy "Anyone can read love pages"
  on public.love_pages for select
  using (true);

create policy "Anyone can create a love page"
  on public.love_pages for insert
  with check (true);

create policy "Anyone can update a love page"
  on public.love_pages for update
  using (true);

create policy "Anyone can delete a love page"
  on public.love_pages for delete
  using (true);

-- ============================================================
-- STORAGE BUCKET SETUP (do this in the Supabase Dashboard UI)
-- ============================================================
-- Go to: Storage → New bucket
--   Name:   love-page-images
--   Public: YES  ← very important, otherwise images won't load
--
-- Then add a storage policy:
--   Storage → love-page-images → Policies → New policy
--   Operation: INSERT (for uploads)
--   Target roles: anon
--   Policy: true
--
-- Repeat for SELECT (public reads):
--   Operation: SELECT
--   Target roles: anon
--   Policy: true
