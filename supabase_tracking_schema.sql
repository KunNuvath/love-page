-- ============================================================================
-- LovePage Database Tracking Schema (Users, 5 Templates, Uploads & Payments)
-- Run this once in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Upgrade existing `love_pages` table to track owner, template & photos
alter table public.love_pages
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists user_email text,
  add column if not exists template_type text not null default 'polaroid-scrapbook',
  add column if not exists photo_urls jsonb not null default '[]'::jsonb,
  add column if not exists photo_count integer not null default 0;

create index if not exists idx_love_pages_user_id on public.love_pages(user_id);
create index if not exists idx_love_pages_user_email on public.love_pages(user_email);
create index if not exists idx_love_pages_template_type on public.love_pages(template_type);
create index if not exists idx_love_pages_created_at on public.love_pages(created_at desc);

-- 2. Track every uploaded photo/media file with its owner & template
create table if not exists public.user_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  template_type text not null default 'unknown',
  slot_name text,
  file_url text not null,
  storage_path text,
  mime_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_uploads_user_id on public.user_uploads(user_id);
create index if not exists idx_user_uploads_user_email on public.user_uploads(user_email);
create index if not exists idx_user_uploads_template_type on public.user_uploads(template_type);
create index if not exists idx_user_uploads_created_at on public.user_uploads(created_at desc);

alter table public.user_uploads enable row level security;

drop policy if exists "Users can view their own uploads" on public.user_uploads;
create policy "Users can view their own uploads"
  on public.user_uploads
  for select
  using (auth.uid() = user_id);

-- 3. Track every Paddle payment & VIP code unlock
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  template_id text not null,
  provider text not null default 'paddle',
  transaction_id text unique,
  amount numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_user_email on public.payments(user_email);
create index if not exists idx_payments_template_id on public.payments(template_id);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

alter table public.payments enable row level security;

drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
  on public.payments
  for select
  using (auth.uid() = user_id);

-- 4. Convenient Overview View: See every user's pages, templates, photos & payments
create or replace view public.user_activity_summary as
select
  u.id as user_id,
  u.email as user_email,
  u.created_at as signed_up_at,
  coalesce(lp.pages_count, 0) as pages_created,
  coalesce(lp.templates_used, '{}'::text[]) as templates_used,
  coalesce(up.uploads_count, 0) as photos_uploaded,
  coalesce(pay.payments_count, 0) as payments_count,
  coalesce(pay.total_paid_usd, 0) as total_paid_usd,
  coalesce(pay.unlocked_templates, '{}'::text[]) as unlocked_templates
from auth.users u
left join (
  select
    user_id,
    count(*)::int as pages_count,
    array_agg(distinct template_type) as templates_used
  from public.love_pages
  where user_id is not null
  group by user_id
) lp on lp.user_id = u.id
left join (
  select
    user_id,
    count(*)::int as uploads_count
  from public.user_uploads
  where user_id is not null
  group by user_id
) up on up.user_id = u.id
left join (
  select
    user_id,
    count(*)::int as payments_count,
    sum(amount)::numeric(10,2) as total_paid_usd,
    array_agg(distinct template_id) as unlocked_templates
  from public.payments
  where user_id is not null and status = 'completed'
  group by user_id
) pay on pay.user_id = u.id;
