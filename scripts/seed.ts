// Fills the dashboard with CLEARLY FAKE data so you can see what it looks like.
//   npm run seed          adds fake rows (removes older fake rows first, so it is safe to re-run)
//   npm run seed:remove   deletes exactly the fake rows and nothing else
//
// How fake rows are recognised:
//   download_events.visitor_id always starts with "seed-"
//   app_first_opens.install_id always starts with 5eed0000-0000-4000-8000-  (a uuid cannot hold the word "seed")
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local (or the shell).
import { createClient } from "@supabase/supabase-js";
import { APP_VERSION } from "../lib/config";
import type { DownloadEvent, FirstOpen } from "../lib/types";

try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the shell environment */ }

const SEED_PREFIX = "seed-";
const INSTALL_PREFIX = "5eed0000-0000-4000-8000-";
const DAYS = 45;

type Row = Omit<DownloadEvent, "id" | "created_at"> & { created_at: string };

// Small seeded random generator so the fake data looks the same every run.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2024);
// Picks one value at random; the number next to each value is how likely it is (bigger = more often).
function pick<T>(items: ReadonlyArray<readonly [T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) { r -= w; if (r <= 0) return item; }
  return items[items.length - 1][0];
}

const COUNTRIES = [["NG", 70], ["GH", 6], ["GB", 5], ["US", 5], ["KE", 3], ["CA", 2], ["ZA", 2], ["DE", 1], ["IN", 1], [null, 1]] as const;
const REGIONS: Record<string, readonly string[]> = { NG: ["LA", "FC", "RI", "KN", "OY", "EN"], GB: ["ENG"], US: ["TX", "NY"] };
type Src = { s: string | null; m: string | null; c: string | null };
type Dev = Pick<DownloadEvent, "device_type" | "os" | "browser">;
const SOURCES: ReadonlyArray<readonly [Src, number]> = [
  [{ s: null, m: null, c: null }, 40],
  [{ s: "instagram", m: "social", c: "launch_week" }, 20],
  [{ s: "whatsapp", m: "social", c: "friends_share" }, 15],
  [{ s: "twitter", m: "social", c: "launch_week" }, 10],
  [{ s: "newsletter", m: "email", c: "welcome" }, 8],
  [{ s: "clinic_poster", m: "qr", c: "lagos_clinics" }, 7],
];
const REFERRERS = [[null, 45], ["l.instagram.com", 18], ["t.co", 10], ["facebook.com", 9], ["google.com", 12], ["wa.me", 6]] as const;
const BUTTONS = [["hero", 42], ["nav", 22], ["closing", 18], ["install", 10], ["doctors", 6], ["other", 2]] as const;
const DEVICES: ReadonlyArray<readonly [Dev, number]> = [
  [{ device_type: "mobile", os: "Android", browser: "Chrome" }, 52],
  [{ device_type: "mobile", os: "Android", browser: "Samsung Internet" }, 10],
  [{ device_type: "mobile", os: "Android", browser: "Facebook app" }, 6],
  [{ device_type: "mobile", os: "iOS", browser: "Safari" }, 8],
  [{ device_type: "tablet", os: "Android", browser: "Chrome" }, 2],
  [{ device_type: "desktop", os: "Windows", browser: "Chrome" }, 11],
  [{ device_type: "desktop", os: "macOS", browser: "Safari" }, 5],
  [{ device_type: "desktop", os: "Linux", browser: "Firefox" }, 1],
];

function fakeEvents(): Row[] {
  const rows: Row[] = [];
  const now = Date.now();
  const visitors = Array.from({ length: 700 }, (_, i) => `${SEED_PREFIX}${String(i).padStart(4, "0")}`);
  for (let day = DAYS - 1; day >= 0; day--) {
    const weekend = [0, 6].includes(new Date(now - day * 86_400_000).getUTCDay());
    const growth = 0.6 + (DAYS - day) / DAYS;               // gently rising trend
    const count = Math.round((22 + rand() * 16) * growth * (weekend ? 0.7 : 1));
    for (let i = 0; i < count; i++) {
      // More clicks in the evening (Lagos time), fewer at night.
      const hour = pick([[7, 4], [9, 6], [12, 8], [15, 8], [19, 12], [21, 10], [23, 3], [3, 1]] as const);
      const at = new Date(now - day * 86_400_000);
      at.setUTCHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
      if (at.getTime() > now) at.setTime(now - Math.floor(rand() * 3_600_000));
      const country = pick(COUNTRIES);
      const regions = country ? REGIONS[country] : undefined;
      const src = pick(SOURCES);
      const dev = pick(DEVICES);
      // Repeat visitors: pick from a small pool so some people click more than once.
      const visitor = visitors[Math.floor(Math.pow(rand(), 1.3) * visitors.length)];
      rows.push({
        created_at: at.toISOString(),
        visitor_id: visitor,
        ip_hash: `${SEED_PREFIX}${visitor.slice(5)}-${at.toISOString().slice(0, 10)}`,
        country,
        region: regions ? regions[Math.floor(rand() * regions.length)] : null,
        ...dev,
        referrer_host: pick(REFERRERS),
        utm_source: src.s, utm_medium: src.m, utm_campaign: src.c,
        button_location: pick(BUTTONS),
        is_bot: false,
        app_version: APP_VERSION,
      });
    }
    // A few bot hits per day so the "Include bots" switch has something to show.
    for (let b = 0; b < 1 + Math.floor(rand() * 4); b++) {
      const at = new Date(now - day * 86_400_000 - Math.floor(rand() * 40_000_000));
      rows.push({
        created_at: at.toISOString(), visitor_id: `${SEED_PREFIX}bot-${day}-${b}`, ip_hash: `${SEED_PREFIX}bot-${day}-${b}`,
        country: pick([["US", 5], ["IE", 2], ["SG", 1]] as const), region: null,
        device_type: "desktop", os: "other", browser: "other",
        referrer_host: null, utm_source: null, utm_medium: null, utm_campaign: null,
        button_location: "other", is_bot: true, app_version: APP_VERSION,
      });
    }
  }
  return rows;
}

/** About 30% of Android clickers "open the app" in the fake data. */
function fakeFirstOpens(events: Row[]): Pick<FirstOpen, "install_id" | "app_version" | "os" | "created_at">[] {
  const android = events.filter((e) => !e.is_bot && e.os === "Android");
  const opens = [];
  for (let i = 0; i < android.length; i++) {
    if (rand() > 0.3) continue;
    const at = new Date(new Date(android[i].created_at).getTime() + 5 * 60_000 + rand() * 6 * 3_600_000);
    if (at.getTime() > Date.now()) continue;
    opens.push({
      install_id: `${INSTALL_PREFIX}${String(opens.length).padStart(12, "0")}`,
      app_version: APP_VERSION, os: "android", created_at: at.toISOString(),
    });
  }
  return opens;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env.local).");
  const db = createClient(url, key, { auth: { persistSession: false } });

  // Delete exactly the fake rows (and only those).
  const lo = `${INSTALL_PREFIX}000000000000`;
  const hi = `${INSTALL_PREFIX}ffffffffffff`;
  const a = await db.from("download_events").delete({ count: "exact" }).like("visitor_id", `${SEED_PREFIX}%`);
  const b = await db.from("app_first_opens").delete({ count: "exact" }).gte("install_id", lo).lte("install_id", hi);
  if (a.error || b.error) throw new Error((a.error ?? b.error)!.message);
  console.log(`Removed ${a.count ?? 0} fake events and ${b.count ?? 0} fake first opens.`);
  if (process.argv.includes("--remove")) return;

  const events = fakeEvents();
  const opens = fakeFirstOpens(events);
  for (let i = 0; i < events.length; i += 500) {
    const { error } = await db.from("download_events").insert(events.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  for (let i = 0; i < opens.length; i += 500) {
    const { error } = await db.from("app_first_opens").insert(opens.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  console.log(`Added ${events.length} fake events and ${opens.length} fake first opens. Remove them with: npm run seed:remove`);
}

main().catch((err) => { console.error(err instanceof Error ? err.message : err); process.exit(1); });
