-- ImageCarbon cache: sites and per-site image metadata (JSON strings for optimized/original/uploaded)

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  site_url text not null unique,
  date_collected timestamptz,
  screenshot text
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  site_url text not null,
  optimized text not null,
  original text not null,
  uploaded text not null,
  width integer,
  height integer
);

create index if not exists images_site_url_idx on public.images (site_url);

-- Public read/write via service role from Next.js API only; lock down for anon if you add a browser client later.
alter table public.sites enable row level security;
alter table public.images enable row level security;

-- No policies: anon/authenticated cannot access; service role bypasses RLS.
