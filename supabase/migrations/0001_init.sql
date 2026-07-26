-- 0001_init.sql
-- Peta Informasi Kebomas — skema awal

create extension if not exists "pgcrypto";
create extension if not exists moddatetime schema extensions;

-- ============ TABLES ============

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  created_at timestamptz default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete restrict,
  name text not null,
  address text not null,
  description text,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_locations_category_id on locations (category_id);

-- ============ updated_at TRIGGER ============

create trigger handle_updated_at
  before update on locations
  for each row
  execute function extensions.moddatetime (updated_at);

-- ============ RLS ============

alter table categories enable row level security;
alter table locations enable row level security;

-- Public read
create policy "public read categories" on categories
  for select using (true);

create policy "public read locations" on locations
  for select using (true);

-- Admin write only (authenticated role — Supabase Auth users)
create policy "admin insert categories" on categories
  for insert to authenticated with check (true);
create policy "admin update categories" on categories
  for update to authenticated using (true);
create policy "admin delete categories" on categories
  for delete to authenticated using (true);

create policy "admin insert locations" on locations
  for insert to authenticated with check (true);
create policy "admin update locations" on locations
  for update to authenticated using (true);
create policy "admin delete locations" on locations
  for delete to authenticated using (true);
