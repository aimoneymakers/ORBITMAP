-- Run ONCE in Supabase > SQL Editor. Safe to run again (never deletes data).
-- Creates/upgrades the table that stores messages from the /contact form.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  inquiry_type text not null default 'other',
  description text not null default '',
  source_page text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- If you already created this table yourself, make sure these columns exist:
alter table public.contact_submissions add column if not exists id uuid default gen_random_uuid();
alter table public.contact_submissions add column if not exists name text not null default '';
alter table public.contact_submissions add column if not exists email text not null default '';
alter table public.contact_submissions add column if not exists inquiry_type text not null default 'other';
alter table public.contact_submissions add column if not exists description text not null default '';
alter table public.contact_submissions add column if not exists source_page text;
alter table public.contact_submissions add column if not exists is_read boolean not null default false;
alter table public.contact_submissions add column if not exists created_at timestamptz not null default now();

alter table public.contact_submissions enable row level security;
-- No public policies needed: the form now saves through /api/contact (server),
-- and only admins read messages through /api/admin/messages.
