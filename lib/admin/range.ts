// Turns the dashboard's URL (?range=7d&bots=1&from=...&to=...) into a safe date filter.
// Every value from the URL is checked here, so nothing unexpected reaches the database.
// Days start at midnight in Nigeria (UTC+1, no daylight saving), because that is when the team thinks a day starts.
import type { AdminFilter } from "@/lib/types";

export const TZ_OFFSET_MS = 60 * 60 * 1000; // Nigeria time (WAT) is UTC+1 all year
export const DAY_MS = 24 * 60 * 60 * 1000;
export const ALL_TIME_FROM = "1970-01-01T00:00:00.000Z";
export const MAX_CUSTOM_DAYS = 800;

export const RANGE_KEYS = ["today", "7d", "30d", "all", "custom"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];
export const DEFAULT_RANGE: RangeKey = "7d";

export type RawParams = Record<string, string | string[] | undefined>;

export interface ParsedRange {
  key: RangeKey;
  filter: AdminFilter;
  granularity: "hour" | "day";
  label: string;
  /** YYYY-MM-DD values for the custom date inputs (empty unless key is "custom"). */
  customFrom: string;
  customTo: string;
  /** A friendly message when the URL held something we ignored. */
  notice: string | null;
}

/** Midnight (Nigeria time) at the start of the day that contains `d`, returned as a real UTC Date. */
export function startOfDay(d: Date): Date {
  const shifted = new Date(d.getTime() + TZ_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - TZ_OFFSET_MS);
}

/** "2026-11-06" for the Nigeria-time day of `d`. */
export function dayKey(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return new Date(t.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** "2026-11-06T14" for the Nigeria-time hour of `d`. */
export function hourKey(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return new Date(t.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 13);
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** True only for real calendar dates written as YYYY-MM-DD. */
export function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Start of a YYYY-MM-DD day in Nigeria time, as a UTC Date. */
function dayStringToStart(s: string): Date {
  return new Date(new Date(`${s}T00:00:00.000Z`).getTime() - TZ_OFFSET_MS);
}

export function parseBots(params: RawParams): boolean {
  return first(params.bots) === "1";
}

export function parseRange(params: RawParams, now: Date = new Date()): ParsedRange {
  const includeBots = parseBots(params);
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
  const asked = first(params.range);
  let notice: string | null = null;
  let key: RangeKey = DEFAULT_RANGE;

  if ((RANGE_KEYS as readonly string[]).includes(asked)) key = asked as RangeKey;
  else if (asked) notice = "That date range was not recognised, so the last 7 days are shown.";

  const make = (k: RangeKey, from: Date, to: Date, granularity: "hour" | "day", label: string, cf = "", ct = ""): ParsedRange => ({
    key: k,
    filter: { from: from.toISOString(), to: to.toISOString(), includeBots },
    granularity,
    label,
    customFrom: cf,
    customTo: ct,
    notice,
  });

  if (key === "custom") {
    const f = first(params.from);
    const t = first(params.to);
    if (isValidDateString(f) && isValidDateString(t)) {
      const today = dayKey(now);
      const toDay = t > today ? today : t; // no point looking past today
      const fromStart = dayStringToStart(f);
      const toEnd = new Date(dayStringToStart(toDay).getTime() + DAY_MS);
      const days = Math.round((toEnd.getTime() - fromStart.getTime()) / DAY_MS);
      if (f <= toDay && days <= MAX_CUSTOM_DAYS) {
        return make("custom", fromStart, toEnd, days <= 1 ? "hour" : "day", f === toDay ? f : `${f} to ${toDay}`, f, toDay);
      }
    }
    notice = "That custom date range is not valid, so the last 7 days are shown.";
    key = DEFAULT_RANGE;
  }

  switch (key) {
    case "today":
      return make("today", todayStart, tomorrowStart, "hour", "Today");
    case "30d":
      return make("30d", new Date(todayStart.getTime() - 29 * DAY_MS), tomorrowStart, "day", "Last 30 days");
    case "all":
      return make("all", new Date(ALL_TIME_FROM), tomorrowStart, "day", "All time");
    default:
      return make("7d", new Date(todayStart.getTime() - 6 * DAY_MS), tomorrowStart, "day", "Last 7 days");
  }
}

/** Query string that reproduces the current view (used by links and the CSV export). */
export function rangeToQuery(p: ParsedRange): string {
  const q = new URLSearchParams();
  q.set("range", p.key);
  if (p.key === "custom") {
    q.set("from", p.customFrom);
    q.set("to", p.customTo);
  }
  if (p.filter.includeBots) q.set("bots", "1");
  return q.toString();
}
