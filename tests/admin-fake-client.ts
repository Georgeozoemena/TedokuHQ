// Test helper: a tiny stand-in for the Supabase client. It records the filters it was given
// and serves rows page by page, like PostgREST does. Not a test file itself.
import type { SupabaseClient } from "@supabase/supabase-js";

export function fakeClient(rows: Record<string, unknown>[]) {
  const calls = { ranges: [] as [number, number][], eq: [] as [string, unknown][], tables: [] as string[] };
  const builder = {
    select: () => builder,
    gte: () => builder,
    lt: () => builder,
    order: () => builder,
    eq: (col: string, val: unknown) => { calls.eq.push([col, val]); return builder; },
    range: (a: number, b: number) => {
      calls.ranges.push([a, b]);
      return Promise.resolve({ data: rows.slice(a, b + 1), error: null });
    },
  };
  const client = { from: (t: string) => { calls.tables.push(t); return builder; } } as unknown as SupabaseClient;
  return { client, calls };
}

export function eventRow(over: Partial<Record<string, unknown>> = {}) {
  return {
    created_at: "2026-11-05T10:00:00.000Z",
    visitor_id: "v1",
    country: "NG",
    device_type: "mobile",
    os: "Android",
    browser: "Chrome",
    referrer_host: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    button_location: "hero",
    is_bot: false,
    ...over,
  };
}
