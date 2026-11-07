-- Tedoku download tracking: tables, indexes, Row Level Security and admin access.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
--
-- How access works, in plain English:
--   * The public website never talks to these tables directly. Only our server code does,
--     using the secret "service role" key, which is allowed to insert rows.
--   * Nobody who is not signed in (the "anon" role) can read or write anything.
--   * A signed-in person can read the numbers only if their email is listed in admin_users.
--   * Nobody can edit or delete rows through the website. Deleting old rows is done by the
--     nightly retention job.

-- ---------------------------------------------------------------------------
-- 1. Download clicks. One row per click on a Download button (bots included, flagged).
--    No raw IP addresses and no raw user agents are ever stored.
-- ---------------------------------------------------------------------------
create table if not exists public.download_events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  visitor_id      text check (char_length(visitor_id) <= 64),  -- random id from the tdk_vid cookie
  ip_hash         text check (char_length(ip_hash) <= 64),     -- salted SHA-256 of IP + date; changes daily
  country         text check (country ~ '^[A-Z]{2}$'),         -- from the hosting platform, e.g. NG
  region          text check (char_length(region) <= 10),
  device_type     text not null check (device_type in ('mobile', 'tablet', 'desktop')),
  os              text not null check (os in ('Android', 'iOS', 'Windows', 'macOS', 'Linux', 'other')),
  browser         text not null default 'other' check (char_length(browser) <= 40),
  referrer_host   text check (char_length(referrer_host) <= 100), -- host only, never the full URL
  utm_source      text check (char_length(utm_source) <= 100),
  utm_medium      text check (char_length(utm_medium) <= 100),
  utm_campaign    text check (char_length(utm_campaign) <= 100),
  button_location text not null default 'other'
                  check (button_location in ('nav', 'hero', 'doctors', 'closing', 'install', 'other')),
  is_bot          boolean not null default false,
  app_version     text not null check (char_length(app_version) <= 32)
);

comment on table public.download_events is
  'One row per click on a Download button. Anonymous: no raw IP, no raw user agent, no names.';
comment on column public.download_events.visitor_id is 'Random id from the first-party tdk_vid cookie. Lets us count repeat clicks by the same browser once.';
comment on column public.download_events.ip_hash is 'Salted SHA-256 of IP + date. Cannot be reversed and is different every day.';
comment on column public.download_events.is_bot is 'True for crawlers, link previews and automated requests. Hidden from the dashboard by default.';

create index if not exists download_events_created_at_idx  on public.download_events (created_at);
create index if not exists download_events_visitor_id_idx  on public.download_events (visitor_id);
create index if not exists download_events_country_idx     on public.download_events (country);
create index if not exists download_events_os_idx          on public.download_events (os);
create index if not exists download_events_device_type_idx on public.download_events (device_type);
create index if not exists download_events_is_bot_idx      on public.download_events (is_bot, created_at);

-- ---------------------------------------------------------------------------
-- 2. First opens. One row per app install that called POST /api/first-open.
--    Not linked to any account. install_id is a random uuid made by the app itself.
-- ---------------------------------------------------------------------------
create table if not exists public.app_first_opens (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  install_id  uuid not null unique,                       -- unique: calling twice does not double count
  app_version text not null check (char_length(app_version) <= 32),
  os          text not null check (char_length(os) <= 16)
);

comment on table public.app_first_opens is
  'One row per app install, sent once by the app on first launch. No personal data, no account link.';

create index if not exists app_first_opens_created_at_idx on public.app_first_opens (created_at);

-- ---------------------------------------------------------------------------
-- 3. Admin allowlist. Add an admin with:
--      insert into public.admin_users (email) values ('you@example.com');
--    Emails must be lowercase. (The app also checks the ADMIN_EMAILS environment variable.)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  email text primary key check (email = lower(email))
);

comment on table public.admin_users is 'Emails allowed to read the tracking tables when signed in.';

-- Helper used by the policies below: is the signed-in person an admin?
-- "security definer" lets it read admin_users even though that table is locked down.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security: ON for all three tables. There is NO policy for anon, so anon gets nothing.
--    The service role key (server only) bypasses RLS, which is how the site saves clicks.
-- ---------------------------------------------------------------------------
alter table public.download_events enable row level security;
alter table public.app_first_opens enable row level security;
alter table public.admin_users     enable row level security;

-- Belt and braces: take away table rights from the public roles, then give back read-only to signed-in users
-- (RLS then narrows that to admins).
revoke all on public.download_events, public.app_first_opens, public.admin_users from anon, authenticated;
grant select on public.download_events, public.app_first_opens to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "admins read download_events" on public.download_events;
create policy "admins read download_events" on public.download_events
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read app_first_opens" on public.app_first_opens;
create policy "admins read app_first_opens" on public.app_first_opens
  for select to authenticated using (public.is_admin());

-- An admin can see the admin list; everyone else sees nothing.
drop policy if exists "admins read admin_users" on public.admin_users;
create policy "admins read admin_users" on public.admin_users
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. OPTIONAL: nightly cleanup inside the database with pg_cron.
--    The default is the Vercel cron job (vercel.json -> /api/cron/retention), which does the same thing.
--    Use ONE of the two, not both. To use pg_cron: enable the "pg_cron" extension in
--    Supabase (Database > Extensions), then remove the leading "-- " from the lines below.
-- ---------------------------------------------------------------------------
-- select cron.schedule(
--   'tedoku-retention',
--   '17 3 * * *',  -- every night at 03:17 UTC
--   $$
--     delete from public.download_events where created_at < now() - interval '13 months';
--     delete from public.app_first_opens where created_at < now() - interval '13 months';
--   $$
-- );
-- To stop it later:  select cron.unschedule('tedoku-retention');
