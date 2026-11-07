// Small, safe helpers for reading request data. Everything that comes from the outside
// (query string, cookies, headers) is checked and trimmed here before it goes near the database.
import { BUTTON_LOCATIONS, DEFAULT_BUTTON_LOCATION, type ButtonLocation } from "@/lib/constants";

/** Reads one cookie value from a raw Cookie header. Returns null if missing. */
export function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim() || null;
  }
  return null;
}

/** ?from= must be one of the allowed button names; anything else becomes "other". */
export function parseButtonLocation(value: string | null | undefined): ButtonLocation {
  return (BUTTON_LOCATIONS as readonly string[]).includes(value ?? "")
    ? (value as ButtonLocation)
    : DEFAULT_BUTTON_LOCATION;
}

/** Visitor ids must look like a UUID (or the seed marker) so junk cannot be stored. */
export function cleanVisitorId(value: string | null): string | null {
  return value && /^[A-Za-z0-9-]{8,64}$/.test(value) ? value : null;
}

/** Lowercase, keep only plain characters, max 100 long. Empty becomes null. */
export function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase().replace(/[^\p{L}\p{N} ._\-+/:]/gu, "").trim().slice(0, 100);
  return v || null;
}

export interface UtmValues {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  /** Optional: host of the page that sent the visitor to the landing page (see note below). */
  landingReferrerHost: string | null;
}

/**
 * Reads the short-lived tdk_utm cookie: URL-encoded JSON {s,m,c} written by the landing page.
 * Optional key r = referrer host of the first landing visit (the landing page may add it so we
 * know where people really came from; the Referer header on /download is just our own site).
 * Bad or missing cookies give all nulls.
 */
export function parseUtmCookie(raw: string | null): UtmValues {
  const empty: UtmValues = { utm_source: null, utm_medium: null, utm_campaign: null, landingReferrerHost: null };
  if (!raw) return empty;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof data !== "object" || data === null) return empty;
    const o = data as Record<string, unknown>;
    return {
      utm_source: cleanLabel(o.s),
      utm_medium: cleanLabel(o.m),
      utm_campaign: cleanLabel(o.c),
      landingReferrerHost: hostOnly(typeof o.r === "string" ? o.r : null),
    };
  } catch {
    return empty;
  }
}

/** Host only (no path, no query), lowercase, no "www.". Accepts a full URL or a bare host. */
export function hostOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "").slice(0, 100);
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Referrer host for the event. If the Referer is our own site (a normal click from the landing
 * page) it tells us nothing, so we use the landing visit's referrer from the cookie, or null.
 */
export function pickReferrerHost(
  refererHeader: string | null,
  ownHosts: string[],
  landingReferrerHost: string | null,
): string | null {
  const host = hostOnly(refererHeader);
  const own = ownHosts.map((h) => hostOnly(h)).filter(Boolean);
  if (host && !own.includes(host)) return host;
  if (landingReferrerHost && !own.includes(landingReferrerHost)) return landingReferrerHost;
  return null;
}

/** Client IP: first entry of x-forwarded-for, else x-real-ip. Returns null if absent. */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip")?.trim() || "";
  return ip && ip.length <= 64 ? ip : null;
}

/** Country from the host's geo header: two capital letters or null. */
export function cleanCountry(value: string | null): string | null {
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}

/** Region code (for example "LA" for Lagos) or null. */
export function cleanRegion(value: string | null): string | null {
  return value && /^[A-Za-z0-9-]{1,10}$/.test(value) ? value : null;
}
