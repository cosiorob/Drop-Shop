-- ============================================================
-- DROPSHOP — Full Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  role text not null check (role in ('consumer', 'retailer')),
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- stores
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  address text,
  phone text,
  balance_cents integer default 0,
  created_at timestamptz default now()
);

-- categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text
);

-- drops
create table if not exists drops (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  description text,
  size text,
  retail_value_cents integer not null,
  price_per_spot_cents integer not null,
  total_spots integer not null,
  spots_claimed integer default 0,
  closes_at timestamptz not null,
  status text default 'draft' check (status in ('draft','active','closed','completed')),
  winner_id uuid references profiles(id),
  pickup_name text,
  pickup_address text,
  pickup_phone text,
  created_at timestamptz default now()
);

-- drop_images
create table if not exists drop_images (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references drops(id) on delete cascade,
  url text not null,
  position integer default 0
);

-- entries
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references drops(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  stripe_payment_intent_id text,
  spots_count integer not null default 1 check (spots_count between 1 and 10),
  selected_number integer check (selected_number between 1 and 10),
  created_at timestamptz default now()
  -- no unique(drop_id, user_id) — multi-entry per user allowed
);

-- follows
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  store_id uuid references stores(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  created_at timestamptz default now(),
  check (
    (store_id is not null and category_id is null) or
    (store_id is null and category_id is not null)
  )
);

-- notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  drop_id uuid references drops(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Seed categories
-- ============================================================
insert into categories (name, slug, icon) values
  ('Sports', 'sports', '🏆'),
  ('Men''s Athleisure', 'mens-athleisure', '👟'),
  ('Women''s Athleisure', 'womens-athleisure', '🧘'),
  ('Boutique Clothing', 'boutique-clothing', '👗'),
  ('Shoes', 'shoes', '👠'),
  ('Boutique Jewelry', 'boutique-jewelry', '💎'),
  ('Watches', 'watches', '⌚'),
  ('Accessories', 'accessories', '🎒')
on conflict (slug) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table drops enable row level security;
alter table drop_images enable row level security;
alter table entries enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
do $$ begin

  -- profiles
  drop policy if exists "profiles_select_own" on profiles;
  drop policy if exists "profiles_insert_own" on profiles;
  drop policy if exists "profiles_update_own" on profiles;

  -- stores
  drop policy if exists "stores_select_all" on stores;
  drop policy if exists "stores_insert_own" on stores;
  drop policy if exists "stores_update_own" on stores;

  -- categories
  drop policy if exists "categories_select_all" on categories;

  -- drops
  drop policy if exists "drops_select_all" on drops;
  drop policy if exists "drops_insert_own" on drops;
  drop policy if exists "drops_update_own" on drops;

  -- drop_images
  drop policy if exists "drop_images_select_all" on drop_images;
  drop policy if exists "drop_images_insert_own" on drop_images;

  -- entries
  drop policy if exists "entries_select_own" on entries;
  drop policy if exists "entries_insert_auth" on entries;

  -- follows
  drop policy if exists "follows_select_own" on follows;
  drop policy if exists "follows_insert_own" on follows;
  drop policy if exists "follows_delete_own" on follows;

  -- notifications
  drop policy if exists "notifications_select_own" on notifications;
  drop policy if exists "notifications_update_own" on notifications;

end $$;

-- profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- stores: public read
create policy "stores_select_all" on stores for select using (true);
create policy "stores_insert_own" on stores for insert with check (auth.uid() = owner_id);
create policy "stores_update_own" on stores for update using (auth.uid() = owner_id);

-- categories: public read
create policy "categories_select_all" on categories for select using (true);

-- drops: public read
create policy "drops_select_all" on drops for select using (true);
create policy "drops_insert_own" on drops for insert with check (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);
create policy "drops_update_own" on drops for update using (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);

-- drop_images: public read
create policy "drop_images_select_all" on drop_images for select using (true);
create policy "drop_images_insert_own" on drop_images for insert with check (true);

-- entries
create policy "entries_select_own" on entries for select using (auth.uid() = user_id);
create policy "entries_insert_auth" on entries for insert with check (auth.uid() = user_id);

-- follows
create policy "follows_select_own" on follows for select using (auth.uid() = user_id);
create policy "follows_insert_own" on follows for insert with check (auth.uid() = user_id);
create policy "follows_delete_own" on follows for delete using (auth.uid() = user_id);

-- notifications
create policy "notifications_select_own" on notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on notifications for update using (auth.uid() = user_id);
