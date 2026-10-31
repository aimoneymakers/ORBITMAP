-- Run this ONCE in Supabase > SQL Editor > New query > Run.
-- Creates (or upgrades) the table used by /products and by Admin > Products.
-- Safe to run again: it never deletes your data.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text,
  category text not null default 'other',
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  gallery_urls text[] not null default '{}',
  price_cents integer not null default 0,
  original_price_cents integer,
  currency text not null default 'USD',
  affiliate_url text not null default '',
  rating numeric not null default 0,
  rating_count integer not null default 0,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  sort_weight integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you already had a products table, make sure every column exists:
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists category text not null default 'other';
alter table public.products add column if not exists short_description text not null default '';
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists image_url text not null default '';
alter table public.products add column if not exists gallery_urls text[] not null default '{}';
alter table public.products add column if not exists price_cents integer not null default 0;
alter table public.products add column if not exists original_price_cents integer;
alter table public.products add column if not exists currency text not null default 'USD';
alter table public.products add column if not exists affiliate_url text not null default '';
alter table public.products add column if not exists rating numeric not null default 0;
alter table public.products add column if not exists rating_count integer not null default 0;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists is_new boolean not null default false;
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists sort_weight integer not null default 0;
alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.products enable row level security;

-- Visitors can only READ active products.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select using (is_active = true);

-- Nobody can write from the browser. Adding/editing/deleting happens only
-- through /api/admin/products, which checks that you are an admin first.
