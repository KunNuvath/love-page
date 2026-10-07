-- ============================================================
-- LOVE PAGE — Complete Supabase Setup
-- 
-- HOW TO RUN THIS:
--   1. Go to https://supabase.com → your project
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "New query"
--   4. Paste ALL of this file
--   5. Click "Run"
--
-- Do this ONE TIME. Running it again is safe (uses IF NOT EXISTS).
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1.  TABLE: love_pages
-- ─────────────────────────────────────────────────────────────
-- This is where every love page is saved when someone clicks "Share".
-- The "slug" column is the short random id that appears in the link:
--   https://your-app.vercel.app/p/<slug>

create table if not exists public.love_pages (
  id          text        primary key
                          default ('lp_' || substr(md5(random()::text), 1, 12)),
  slug        text        not null unique,   -- the id in the public URL
  title       text        not null,
  message     text        not null default '', -- JSON blob with all page config
  image_url   text,                           -- public Supabase Storage URL
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Fast lookups by slug (every page load calls .eq('slug', slug))
create index if not exists love_pages_slug_idx
  on public.love_pages (slug);


-- ─────────────────────────────────────────────────────────────
-- 2.  ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
-- RLS is Supabase's "firewall" for each row.
-- Without these policies, anonymous users (your visitors) get blocked
-- even if the table exists — resulting in 404 because getLovePageBySlug
-- returns null.

alter table public.love_pages enable row level security;

-- Allow ANYONE (logged-in or not) to READ any love page
-- This is what lets a friend open a shared link.
drop policy if exists "Public read"   on public.love_pages;
create policy "Public read"
  on public.love_pages
  for select
  using (true);                        -- true = no restrictions

-- Allow ANYONE to CREATE a love page (the creator is anonymous too)
drop policy if exists "Public insert" on public.love_pages;
create policy "Public insert"
  on public.love_pages
  for insert
  with check (true);

-- Allow ANYONE to UPDATE (used when editing/re-saving a page)
drop policy if exists "Public update" on public.love_pages;
create policy "Public update"
  on public.love_pages
  for update
  using (true);

-- Allow ANYONE to DELETE (used if you add a delete button)
drop policy if exists "Public delete" on public.love_pages;
create policy "Public delete"
  on public.love_pages
  for delete
  using (true);


-- ─────────────────────────────────────────────────────────────
-- 3.  STORAGE BUCKET SETUP
-- ─────────────────────────────────────────────────────────────
-- You must do this in the Supabase Dashboard UI (not SQL):
--
--   Step 1: Storage → New bucket
--     Name:    love-page-images
--     Public:  YES  ← CRITICAL — images won't load for visitors if this is OFF
--
--   Step 2: Storage → love-page-images → Policies → New policy
--     Click "For full customization"
--     Policy name: Allow public uploads
--     Allowed operations: SELECT, INSERT
--     Target roles: anon
--     Policy definition (USING):  true
--     Policy definition (WITH CHECK): true
--     Save
--
-- Why: Without a public bucket, the image URL in the database exists but
-- returns 403 Forbidden when a visitor tries to load it.


-- ─────────────────────────────────────────────────────────────
-- 4.  VERIFY EVERYTHING WORKS
-- ─────────────────────────────────────────────────────────────
-- Run this after the above to confirm the table and policies exist:

select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'love_pages';
-- Expected: 1 row, rowsecurity = true

select policyname, cmd
from pg_policies
where tablename = 'love_pages';
-- Expected: 4 rows (Public read, Public insert, Public update, Public delete)
