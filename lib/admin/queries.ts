// Dashboard numbers. Two parts:
//  1) FETCHING: pull the matching rows from Supabase, 1000 at a time (the most one request returns).
//  2) AGGREGATING: plain TypeScript functions that count and group those rows. They take plain arrays,
//     so they are easy to unit test (see tests/admin-queries.test.ts).
//
// WHEN TO MOVE TO SQL: this approach is simple and fine for tens of thousands of clicks. We stop reading at
// MAX_ROWS (50,000) per view. If you regularly get close to that (the dashboard shows a notice when it happens),
// move the counting into SQL views or functions (GROUP BY day, country, ...) and read those instead.
// Nothing else in the dashboard would need to change except computeDashboard().
//
// Privacy: ip_hash is never selected. visitor_id is only used to count people and is dropped before display.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminFilter, DownloadEvent } from "@/lib/types";
import { ALL_TIME_FROM, DAY_MS, dayKey, hourKey, startOfDay } from "@/lib/admin/range";
import { hourLabel, longDay, shortDay } from "@/lib/admin/format";

export const PAGE_SIZE = 1000;
export const MAX_ROWS = 50_000;
export const EXPORT_MAX_ROWS = 200_000;
export const RECENT_LIMIT = 50;

export const EVENT_COLUMNS =
  "created_at,visitor_id,country,device_type,os,browser,referrer_host,utm_source,utm_medium,utm_campaign,button_location,is_bot";
export type EventRow = Pick<
  DownloadEvent,
  | "created_at" | "visitor_id" | "country" | "device_type" | "os" | "browser" | "referrer_host"
  | "utm_source" | "utm_medium" | "utm_campaign" | "button_location" | "is_bot"
>;
export interface OpenRow {
  created_at: string;
  os: string;
  app_version: string;
}

// ---------------------------------------------------------------------------------------------
// 1) FETCHING
// ---------------------------------------------------------------------------------------------

/** Yields pages of up to 1000 rows, newest first, until the table runs out or maxRows is reached. */
export async function* iteratePages<T>(
  client: SupabaseClient,
  table: "download_events" | "app_first_opens",
  columns: string,
  filter: AdminFilter,
  maxRows = MAX_ROWS,
): AsyncGenerator<T[]> {
  let offset = 0;
  while (offset < maxRows) {
    const take = Math.min(PAGE_SIZE, maxRows - offset);
    // Parameterised by supabase-js: values are sent as parameters, never glued into SQL text.
    let q = client.from(table).select(columns).gte("created_at", filter.from).lt("created_at", filter.to);
    if (table === "download_events" && !filter.includeBots) q = q.eq("is_bot", false);
    const { data, error } = await q
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }) // tie-breaker so pages never overlap
      .range(offset, offset + take - 1);
    if (error) throw new Error(`Database read failed: ${error.message}`);
    const page = (data ?? []) as unknown as T[]; // supabase-js cannot know our column types without generated types
    if (page.length === 0) return;
    yield page;
    if (page.length < take) return;
    offset += page.length;
  }
}

export async function fetchAll<T>(
  client: SupabaseClient,
  table: "download_events" | "app_first_opens",
  columns: string,
  filter: AdminFilter,
  maxRows = MAX_ROWS,
): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  for await (const page of iteratePages<T>(client, table, columns, filter, maxRows)) rows.push(...page);
  return { rows, truncated: rows.length >= maxRows };
}

// ---------------------------------------------------------------------------------------------
// 2) AGGREGATING (pure functions)
// ---------------------------------------------------------------------------------------------

/** Keeps bots out unless asked. The database query already does this; this is a second, testable safety net. */
export function applyBotFilter<T extends { is_bot: boolean }>(rows: T[], includeBots: boolean): T[] {
  return includeBots ? rows : rows.filter((r) => !r.is_bot);
}

/** Different people, not clicks: distinct visitor ids. Rows with no visitor id cannot be told apart, so they are skipped. */
export function countUniqueVisitors(rows: { visitor_id: string | null }[]): number {
  const seen = new Set<string>();
  for (const r of rows) if (r.visitor_id) seen.add(r.visitor_id);
  return seen.size;
}

export interface Breakdown {
  label: string;
  clicks: number;
  visitors: number;
  share: number; // 0..1 of all clicks in the view
}

export function breakdown<T extends { visitor_id: string | null }>(
  rows: T[],
  keyOf: (row: T) => string,
  limit = Infinity,
): Breakdown[] {
  const groups = new Map<string, { clicks: number; people: Set<string> }>();
  for (const row of rows) {
    const k = keyOf(row);
    const g = groups.get(k) ?? { clicks: 0, people: new Set<string>() };
    g.clicks += 1;
    if (row.visitor_id) g.people.add(row.visitor_id);
    groups.set(k, g);
  }
  const total = rows.length;
  return [...groups.entries()]
    .map(([label, g]) => ({ label, clicks: g.clicks, visitors: g.people.size, share: total ? g.clicks / total : 0 }))
    .sort((a, b) => b.clicks - a.clicks || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export interface SeriesPoint {
  key: string;
  label: string; // short, for the axis
  full: string; // long, for the readout
  clicks: number;
  visitors: number;
}

/** One point per day (or per hour for a single day), including empty buckets so the line has no gaps. */
export function buildSeries(rows: EventRow[], filter: AdminFilter, granularity: "hour" | "day", now: Date = new Date()): SeriesPoint[] {
  const step = granularity === "hour" ? DAY_MS / 24 : DAY_MS;
  const keyOf = granularity === "hour" ? hourKey : dayKey;

  let startMs = new Date(filter.from).getTime();
  if (filter.from === ALL_TIME_FROM) {
    // "All time" starts at the first click we actually have.
    startMs = rows.reduce((min, r) => Math.min(min, new Date(r.created_at).getTime()), now.getTime());
  }
  // Snap to the start of the day / hour so the last bucket (the one containing "now") is never skipped.
  startMs = granularity === "hour" ? startMs - (((startMs % step) + step) % step) : startOfDay(new Date(startMs)).getTime();
  const endMs = Math.min(new Date(filter.to).getTime() - 1, now.getTime());

  const buckets = new Map<string, { at: Date; clicks: number; people: Set<string> }>();
  for (let t = startMs; t <= endMs; t += step) {
    buckets.set(keyOf(new Date(t)), { at: new Date(t), clicks: 0, people: new Set() });
  }

  for (const r of rows) {
    const b = buckets.get(keyOf(r.created_at));
    if (!b) continue;
    b.clicks += 1;
    if (r.visitor_id) b.people.add(r.visitor_id);
  }

  let points = [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, b]): SeriesPoint => ({
      key,
      label: granularity === "hour" ? hourLabel(b.at) : shortDay(b.at),
      full: granularity === "hour" ? `${shortDay(b.at)}, ${hourLabel(b.at)}` : longDay(b.at),
      clicks: b.clicks,
      visitors: b.people.size,
    }));
  if (points.length > 400) points = points.slice(-400);
  return points;
}

export interface RecentRow {
  time: string;
  country: string | null;
  device: string;
  os: string;
  source: string;
  button: string;
  isBot: boolean;
}

/** Latest events with NO identifiers: no visitor id, no ip hash, no row id. */
export function toRecent(rows: EventRow[], limit = RECENT_LIMIT): RecentRow[] {
  return [...rows]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, limit)
    .map((r) => ({
      time: r.created_at,
      country: r.country,
      device: r.device_type,
      os: r.os,
      source: r.utm_source || r.referrer_host || "Direct",
      button: r.button_location,
      isBot: r.is_bot,
    }));
}

export interface DashboardData {
  kpis: {
    totalClicks: number;
    uniqueVisitors: number;
    androidClicks: number;
    desktopClicks: number;
    firstOpens: number;
    openRate: number | null; // first opens / Android clicks, capped at 1; null when it cannot be worked out
    showOpenRate: boolean;
  };
  series: SeriesPoint[];
  referrers: Breakdown[];
  utmSources: Breakdown[];
  utmCampaigns: Breakdown[];
  countries: Breakdown[];
  devices: Breakdown[];
  systems: Breakdown[];
  buttons: Breakdown[];
  recent: RecentRow[];
  opensByVersion: { label: string; count: number }[];
  truncated: boolean;
}

export function computeDashboard(
  eventRows: EventRow[],
  opens: OpenRow[],
  opts: { filter: AdminFilter; granularity: "hour" | "day"; hasAnyFirstOpens: boolean; truncated?: boolean; now?: Date },
): DashboardData {
  const rows = applyBotFilter(eventRows, opts.filter.includeBots);
  const androidClicks = rows.filter((r) => r.os === "Android").length;
  const firstOpens = opens.length;

  const versions = new Map<string, number>();
  for (const o of opens) versions.set(o.app_version, (versions.get(o.app_version) ?? 0) + 1);

  return {
    kpis: {
      totalClicks: rows.length,
      uniqueVisitors: countUniqueVisitors(rows),
      androidClicks,
      desktopClicks: rows.filter((r) => r.device_type === "desktop").length,
      firstOpens,
      openRate: androidClicks > 0 ? Math.min(1, firstOpens / androidClicks) : null,
      showOpenRate: opts.hasAnyFirstOpens,
    },
    series: buildSeries(rows, opts.filter, opts.granularity, opts.now),
    referrers: breakdown(rows, (r: EventRow) => r.referrer_host || "Direct / none", 15),
    utmSources: breakdown(rows, (r: EventRow) => r.utm_source || "(none)", 10),
    utmCampaigns: breakdown(rows, (r: EventRow) => r.utm_campaign || "(none)", 10),
    countries: breakdown(rows, (r: EventRow) => r.country || "Unknown", 10),
    devices: breakdown(rows, (r: EventRow) => r.device_type),
    systems: breakdown(rows, (r: EventRow) => r.os),
    buttons: breakdown(rows, (r: EventRow) => r.button_location),
    recent: toRecent(rows),
    opensByVersion: [...versions.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    truncated: !!opts.truncated,
  };
}

/** Fetch everything the dashboard needs for one filter, then aggregate it. */
export async function loadDashboard(
  client: SupabaseClient,
  filter: AdminFilter,
  granularity: "hour" | "day",
  now: Date = new Date(),
): Promise<DashboardData> {
  const [events, opens, anyOpens] = await Promise.all([
    fetchAll<EventRow>(client, "download_events", EVENT_COLUMNS, filter),
    fetchAll<OpenRow>(client, "app_first_opens", "created_at,os,app_version", filter),
    client.from("app_first_opens").select("id", { count: "exact", head: true }),
  ]);
  if (anyOpens.error) throw new Error(`Database read failed: ${anyOpens.error.message}`);
  return computeDashboard(events.rows, opens.rows, {
    filter,
    granularity,
    hasAnyFirstOpens: (anyOpens.count ?? 0) > 0,
    truncated: events.truncated,
    now,
  });
}
