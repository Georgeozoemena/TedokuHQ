# Tedoku-Admin

The Tedoku Android download site, with download tracking and a private admin dashboard, in one Next.js project.

* **Landing page** (`/`): one page whose job is to get Android users to download the APK. Plus `/privacy` and `/terms`.
* **Download tracking** (`/download`): logs one anonymous event, then redirects to your APK. It never blocks the download.
* **Admin dashboard** (`/admin`): sign-in protected numbers on clicks, visitors, sources, countries, devices and buttons, with CSV export.
* **First-open signal** (`POST /api/first-open`): optional, lets the app report its first launch so you can compare clicks with real installs.

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS 3, Supabase (Postgres + Auth), Vitest. Deploys to Vercel.

## 1. Run it on your computer

```bash
cd Tedoku-Admin
npm install
cp .env.example .env.local     # then fill in the values (section 2)
npm run dev                    # http://localhost:3000
```

Useful commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run seed` (fake data), `npm run seed:remove`.

The landing page works without any keys. Tracking and the dashboard need Supabase (section 3).

## 2. Environment variables (`.env.local`, and in Vercel under Settings > Environment Variables)

| Name | What it is |
|---|---|
| `APK_URL` | **A direct link to the .apk file.** Read only from here, never hard-coded. See the important note below. |
| `NEXT_PUBLIC_SITE_URL` | Your real address, for example `https://tedoku.app`. Used for share images and the sign-in link. |
| `IP_HASH_SALT` | Long random text. Scrambles the IP hash. Make one with `openssl rand -hex 32`. If it is empty, no IP hash is stored. |
| `CRON_SECRET` | Long random text that protects the nightly clean-up route. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase > Project Settings > API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page. **Server only. Never put it in browser code or share it.** |
| `ADMIN_EMAILS` | Comma-separated emails allowed into `/admin`. Anyone else sees "Not authorised". |

### Important: your APK link
The Expo link you have (`https://expo.dev/accounts/george-0zoemena/projects/tedoku/builds/...`) is a **build page**, not the file. If you put it in `APK_URL`, people land on an Expo web page instead of downloading. Get the real file link in one of these ways:
1. On that Expo build page, use **Download** and copy the file link, or run `eas build:list` and use the `buildArtifactUrl`. Expo artifact links can expire, so check them before launch.
2. More reliable: download the .apk once and host it yourself (Supabase Storage with a public bucket, Cloudflare R2, or a GitHub Release). Put that link in `APK_URL`.

Then update `lib/config.ts`: `APP_VERSION`, `APK_SIZE_LABEL` (the real size) and `APK_SHA256` (run `sha256sum tedoku.apk`). Those three are shown on the page, and people use the checksum to check their download. The values in the file now are **placeholders**.

## 3. Set up Supabase (once)

1. Create a project at supabase.com.
2. SQL Editor > paste and run `supabase/migrations/20250101000000_download_tracking.sql`. It creates `download_events`, `app_first_opens` and `admin_users`, with indexes and Row Level Security (the public can't read anything; only signed-in admins can).
3. Auth setup (the dashboard sign-in):
   * **Auth > URL Configuration:** Site URL = your domain. Redirect URLs: `https://YOUR-DOMAIN/admin/auth/callback` and `http://localhost:3000/admin/auth/callback`.
   * **Auth > Providers > Email:** on (magic link). Open each link in the same browser that asked for it.
   * **Auth > Providers > Google:** create an OAuth client in Google Cloud, add `https://<project>.supabase.co/auth/v1/callback` as an authorised redirect, paste the client ID and secret into Supabase.
   * **Recommended:** invite your admins under Auth > Users, then turn off "Allow new users to sign up".
   * **Two-step sign-in (MFA):** Auth > Multi-Factor: TOTP on. Each admin signs in once, opens **Security** in the sidebar and scans the QR code with an authenticator app. After that the dashboard asks for the 6-digit code.
   * **Optional (Pro plan):** Auth > Sessions > time-box sessions to 8 hours. The app also enforces 8 hours itself.
4. Add the admin emails to `ADMIN_EMAILS`. The same list is used by the server checks; the `admin_users` table is a second lock on the database.

## 4. Deploy to Vercel

1. Push this folder to a GitHub repository and import it in Vercel.
2. Add every variable from section 2.
3. Deploy. `vercel.json` already schedules the nightly clean-up (03:17 UTC) that deletes events older than 13 months. Vercel sends `Authorization: Bearer <CRON_SECRET>` to it automatically when `CRON_SECRET` is set.
4. Check: open `/download?from=hero` (should start the APK download), then `/admin` (should ask you to sign in).

Prefer pg_cron? There is an optional commented block at the bottom of the migration.

## 5. How tracking works, and how to read the numbers

Every Download button goes to `/download?from=<where>` (`nav`, `hero`, `doctors`, `closing`, `install`). The route:
1. Always answers with a 302 redirect to `APK_URL`. The address comes only from the environment, never from the link, so it can't be used to send people elsewhere. If logging fails, the redirect still happens.
2. Saves one row: random visitor id (cookie `tdk_vid`, one year), a salted daily hash of the IP (never the IP itself), country, device type, OS, browser name (never the raw browser string), referring website name only, the campaign labels, which button, whether it looks like a bot, and the app version.
3. Limits to 30 requests a minute per IP hash (over the limit: still redirects, not logged). The limit is kept in memory, so on Vercel each server instance counts separately. For a strict limit, swap in Upstash Redis (notes at the top of `lib/track/ratelimit.ts`).

**A click is not an install.** Someone can press Download and never open the file, or install it later, or share the file. Read the numbers like this:
* **Total download clicks:** how many times the button was pressed (bots excluded by default).
* **Unique visitors:** different anonymous browsers, so one person pressing three times counts once.
* **Android clicks:** the people who can actually install. **Desktop clicks** are probably people looking, or sending the link to their phone.
* **Click-to-first-open rate:** first opens divided by Android clicks (needs section 6). It is an estimate. Not everyone who opens the app came through this site.
* A browser with cookies cleared counts as a new visitor. Link-preview bots (WhatsApp, Telegram) are filtered but a few may slip through; switch "Include bots" on to see them.

## 6. Optional: first-open signal (clicks vs installs)

A download click is not an install. To see how many clicks become real installs, the app can tell the site once, on its first launch. The site stores only a random install id, the app version and the OS. It stores no names, phone numbers, account ids or IP addresses, and nothing links to an account.

```
POST https://YOUR-SITE/api/first-open
Content-Type: application/json

{ "installId": "<random uuid v4>", "appVersion": "1.0.0", "os": "android" }
```
Answers: `204` saved (or already saved), `400` invalid, `413` too large, `429` too many, `500` could not save (the app tries again next launch). The same `installId` sent twice is counted once. The Expo code (about 6 lines) is in `docs/expo-first-open.md`. It needs `expo-secure-store`, `expo-crypto` and `expo-constants` in the app.

## 7. Project map

```
app/page.tsx                 landing page (sections in components/landing/)
app/download/route.ts        click log + redirect
app/api/first-open/          install signal
app/api/cron/retention/      nightly clean-up
app/api/admin/export/        CSV export (admin only)
app/admin/                   dashboard, login, security (MFA)
lib/config.ts                version, size, checksum, contact email: edit when you ship
lib/constants.ts, lib/types.ts, lib/env.ts
lib/track/                   parsing, bot detection, rate limit, hashing, logging
lib/admin/                   date ranges, queries, CSV, access checks
lib/supabase/                browser, server and service clients, session refresh
supabase/migrations/         the SQL
scripts/seed.ts              fake data for testing (npm run seed / seed:remove)
tests/                       Vitest tests (npm test)
tailwind.config.ts           colours, radii, shadows (the Tedoku brand tokens)
```

Change colours and shapes in `tailwind.config.ts` and `app/globals.css`. Change words in `components/landing/`. The FAQ text is in `components/landing/faq-data.ts`.

## 8. Security checklist (and where each is met)

* **No open redirect:** the target is only `APK_URL`. A test sends `?url=` and `?next=` and checks they are ignored.
* **No SQL injection:** all database access goes through the Supabase query builder (parameterised). No SQL strings are built from input.
* **No secrets in the browser:** only `NEXT_PUBLIC_*` values reach the browser. The service key is used only in server files.
* **Input validation:** `from` is checked against an allowlist; dates, filters and the first-open body are validated.
* **Security headers:** CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options and Permissions-Policy in `next.config.mjs`. The CSP still allows inline scripts that Next.js needs; a nonce-based CSP would be stricter.
* **Admin routes return 401/403 with no data** when not signed in or not an admin. `tests/admin-access.test.ts` proves it and checks the database is never touched.
* **Keys and salts** are environment variables listed in `.env.example`.
* **Admin pages are not indexed:** `noindex` headers and `robots.txt` Disallow.

## 9. Privacy: for a Nigerian data-protection lawyer to review

The Nigeria Data Protection Act 2023 applies. Please have a lawyer review at least:
1. Whether a country, device type and a hashed IP, plus an anonymous visitor cookie, count as personal data in your case. This design treats them as personal data and keeps them minimal.
2. The legal basis (legitimate interest or consent) for the visitor cookie, and whether the cookie notice should ask for consent instead of informing. The notice currently informs, and tracking works without any tap.
3. The 13-month retention period, and the controller details, registration and contact point (DPO) for the privacy page.
4. Admin sign-in: admin emails are held by Supabase Auth, which stores data outside Nigeria (cross-border transfer rules).
5. The `/privacy` and `/terms` text. Both are drafts. The terms page still needs governing law and company details.

## 10. Things still to fill in
* `APK_URL` (a direct file link), and `APP_VERSION`, `APK_SIZE_LABEL`, `APK_SHA256`, `CONTACT_EMAIL` in `lib/config.ts`.
* The iPhone waitlist form (`app/api/waitlist/route.ts`) stores nothing yet. There is a TODO at the top.
* The phone screens on the landing page are HTML illustrations, labelled as such. Replace them with real screenshots when you want.
* No tests of the dashboard in a real browser or against a live Supabase project have been run. Do a sign-in and a seed-data check (`npm run seed`) after you connect Supabase.
