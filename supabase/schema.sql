-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- It creates the table that stores everything you edit in /admin.

create table if not exists public.site_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.site_settings enable row level security;

-- Anyone can READ settings (they are public: site name, colors, etc.)
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select using (true);

-- NOBODY can write from the browser. Saving happens only through the
-- server route /api/admin/settings, which checks you are an admin first.

insert into public.site_settings (id, data) values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- Public storage bucket for logo / favicon / banner uploads.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can view site assets" on storage.objects;
create policy "Public can view site assets"
  on storage.objects for select using (bucket_id = 'site-assets');
