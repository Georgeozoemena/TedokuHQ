// The /download logic. The route file (app/download/route.ts) is a thin wrapper around handleDownload.
//
// Golden rule: the visitor ALWAYS gets redirected to APK_URL (or "/" if it is not set), even if
// the database is down, the environment is half set up, or anything in here throws. Analytics
// must never break a download.
import { APP_VERSION } from "@/lib/config";
import { UTM_COOKIE, VISITOR_COOKIE } from "@/lib/constants";
import { env } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/server-admin";
import type { DownloadEvent } from "@/lib/types";
import { isBot } from "./bots";
import { hashIp, utcDay } from "./hash";
import { downloadLimiter, type RateLimiter } from "./ratelimit";
import { parseUserAgent } from "./ua";
import {
  cleanCountry, cleanRegion, cleanVisitorId, getClientIp, parseButtonLocation,
  parseUtmCookie, pickReferrerHost, readCookie,
} from "./utm";

/** What we save: a download_events row without the columns the database fills in itself. */
export type NewDownloadEvent = Omit<DownloadEvent, "id" | "created_at">;

/** A function that saves one row. Tests pass one that throws to simulate the database being down. */
export type InsertEvent = (row: NewDownloadEvent) => Promise<void>;

export interface DownloadDeps {
  insert?: InsertEvent;       // default: Supabase insert
  limiter?: RateLimiter;      // default: 30 per minute per ip_hash
  now?: () => Date;           // default: current time
  apkUrl?: string;            // default: process.env.APK_URL
  salt?: string;              // default: process.env.IP_HASH_SALT
  siteHost?: string;          // default: host of NEXT_PUBLIC_SITE_URL
  timeoutMs?: number;         // how long we wait for the database before giving up (default 1500)
}

/** Default saver: parameterised insert through the supabase-js query builder (no raw SQL). */
export const insertDownloadEvent: InsertEvent = async (row) => {
  const { error } = await getServiceClient().from("download_events").insert(row);
  if (error) throw new Error(error.message);
};

/** The redirect target comes ONLY from the environment. Must be a real http(s) URL, else "/". */
export function redirectTarget(apkUrl: string): string {
  try {
    const url = new URL(apkUrl.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "/";
  } catch {
    return "/";
  }
}

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",             // every click must reach the server so it is counted
      "Referrer-Policy": "no-referrer",        // do not tell the APK host which page you were on
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function hostOf(value: string): string {
  try { return new URL(value).host; } catch { return ""; }
}

/** Builds the row to save from the incoming request. Pure: no network, no database. */
export function buildEvent(req: Request, deps: DownloadDeps = {}): NewDownloadEvent {
  const h = req.headers;
  const url = new URL(req.url);
  const now = (deps.now ?? (() => new Date()))();
  const salt = deps.salt ?? env.ipHashSalt;

  const cookieHeader = h.get("cookie");
  const visitorId = cleanVisitorId(readCookie(cookieHeader, VISITOR_COOKIE));
  const utm = parseUtmCookie(readCookie(cookieHeader, UTM_COOKIE));
  const ua = h.get("user-agent");
  const parsed = parseUserAgent(ua);

  const ip = getClientIp(h);
  // If no salt is configured we refuse to store a hash (it would be too easy to reverse).
  const ipHash = ip && salt ? hashIp(ip, salt, utcDay(now)) : null;

  const ownHosts = [deps.siteHost ?? hostOf(env.siteUrl), h.get("x-forwarded-host") ?? "", h.get("host") ?? ""];
  const referer = h.get("referer");

  return {
    visitor_id: visitorId,
    ip_hash: ipHash,
    country: cleanCountry(h.get("x-vercel-ip-country")),
    region: cleanRegion(h.get("x-vercel-ip-country-region")),
    device_type: parsed.device_type,
    os: parsed.os,
    browser: parsed.browser,
    referrer_host: pickReferrerHost(referer, ownHosts, utm.landingReferrerHost),
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    button_location: parseButtonLocation(url.searchParams.get("from")),
    is_bot: isBot({ userAgent: ua, hasCookie: visitorId !== null, hasReferrer: !!referer }),
    app_version: APP_VERSION,
  };
}

/**
 * Saves one event. NEVER throws and never waits longer than timeoutMs.
 * Returns true if the row was saved, false if anything went wrong.
 */
export async function logDownload(row: NewDownloadEvent, insert: InsertEvent, timeoutMs = 1500): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("log timeout")), timeoutMs);
    });
    await Promise.race([insert(row), timeout]);
    return true;
  } catch (err) {
    // Deliberately quiet: log the reason for you, but nothing that identifies the visitor.
    console.error("[download] could not log click:", err instanceof Error ? err.message : "unknown error");
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Prefetch requests (browser guessing you might click) are not real clicks. */
function isPrefetch(req: Request): boolean {
  const purpose = `${req.headers.get("sec-purpose") ?? ""} ${req.headers.get("purpose") ?? ""}`;
  return /prefetch|prerender/i.test(purpose);
}

/** Handles GET /download: log (best effort), then 302. */
export async function handleDownload(req: Request, deps: DownloadDeps = {}): Promise<Response> {
  let target = "/";
  try {
    target = redirectTarget(deps.apkUrl ?? env.apkUrl);
  } catch {
    target = "/";
  }
  try {
    if (!isPrefetch(req)) {
      const row = buildEvent(req, deps);
      // Over the rate limit: still redirect, just do not log. No IP means we cannot limit.
      const allowed = row.ip_hash ? (deps.limiter ?? downloadLimiter).check(row.ip_hash) : true;
      if (allowed) await logDownload(row, deps.insert ?? insertDownloadEvent, deps.timeoutMs);
    }
  } catch (err) {
    console.error("[download] tracking skipped:", err instanceof Error ? err.message : "unknown error");
  }
  return redirectResponse(target);
}

/** HEAD requests (link checkers) get the same redirect but are never logged. */
export function handleDownloadHead(deps: Pick<DownloadDeps, "apkUrl"> = {}): Response {
  return redirectResponse(redirectTarget(deps.apkUrl ?? env.apkUrl));
}
