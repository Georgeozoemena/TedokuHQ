import { describe, expect, it } from "vitest";
import {
  applyBotFilter, breakdown, buildSeries, computeDashboard, countUniqueVisitors, fetchAll, toRecent, PAGE_SIZE, type EventRow,
} from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";
import { eventRow, fakeClient } from "./admin-fake-client";

const ev = (o: Partial<EventRow> = {}) => eventRow(o as Record<string, unknown>) as unknown as EventRow;
const NOW = new Date("2026-11-06T15:30:00.000Z");

describe("unique visitors", () => {
  it("counts the same person once and ignores rows without an id", () => {
    const rows = [ev({ visitor_id: "a" }), ev({ visitor_id: "a" }), ev({ visitor_id: "b" }), ev({ visitor_id: null })];
    expect(countUniqueVisitors(rows)).toBe(2);
  });
});

describe("bot filter", () => {
  const rows = [ev({ is_bot: false }), ev({ is_bot: true }), ev({ is_bot: true })];
  it("drops bots by default and keeps them when asked", () => {
    expect(applyBotFilter(rows, false)).toHaveLength(1);
    expect(applyBotFilter(rows, true)).toHaveLength(3);
  });
  it("is applied to the dashboard totals", () => {
    const filter = parseRange({}, NOW).filter;
    const off = computeDashboard(rows, [], { filter, granularity: "day", hasAnyFirstOpens: false, now: NOW });
    const on = computeDashboard(rows, [], { filter: { ...filter, includeBots: true }, granularity: "day", hasAnyFirstOpens: false, now: NOW });
    expect(off.kpis.totalClicks).toBe(1);
    expect(on.kpis.totalClicks).toBe(3);
  });
});

describe("dashboard maths", () => {
  const filter = parseRange({ range: "7d" }, NOW).filter;
  const rows = [
    ev({ visitor_id: "a", os: "Android", device_type: "mobile", country: "NG", referrer_host: "t.co", created_at: "2026-11-06T09:00:00.000Z" }),
    ev({ visitor_id: "a", os: "Android", device_type: "mobile", country: "NG", created_at: "2026-11-05T09:00:00.000Z" }),
    ev({ visitor_id: "b", os: "Windows", device_type: "desktop", country: "GB", utm_source: "whatsapp", created_at: "2026-11-05T11:00:00.000Z" }),
  ];
  const d = computeDashboard(rows, [{ created_at: "2026-11-06T10:00:00.000Z", os: "android", app_version: "1.0.0" }], { filter, granularity: "day", hasAnyFirstOpens: true, now: NOW });

  it("computes the KPI cards", () => {
    expect(d.kpis).toMatchObject({ totalClicks: 3, uniqueVisitors: 2, androidClicks: 2, desktopClicks: 1, firstOpens: 1, showOpenRate: true });
    expect(d.kpis.openRate).toBeCloseTo(0.5);
  });
  it("groups by country, source and referrer with a Direct fallback", () => {
    expect(d.countries[0]).toMatchObject({ label: "NG", clicks: 2, visitors: 1 });
    expect(d.utmSources.map((x) => x.label)).toContain("whatsapp");
    expect(d.referrers.map((x) => x.label)).toContain("Direct / none");
  });
  it("builds one point per day with empty days included", () => {
    expect(d.series).toHaveLength(7);
    expect(d.series.reduce((s, p) => s + p.clicks, 0)).toBe(3);
    expect(d.series.at(-1)?.clicks).toBe(1);
  });
  it("does not expose identifiers in the recent list", () => {
    const recent = toRecent(rows);
    expect(recent[0].time).toBe("2026-11-06T09:00:00.000Z");
    expect(JSON.stringify(recent)).not.toMatch(/visitor|ip_hash|"a"|"b"/);
  });
  it("caps the open rate at 100 percent", () => {
    const many = Array.from({ length: 5 }, () => ({ created_at: "2026-11-06T10:00:00.000Z", os: "android", app_version: "1" }));
    expect(computeDashboard(rows, many, { filter, granularity: "day", hasAnyFirstOpens: true, now: NOW }).kpis.openRate).toBe(1);
  });
  it("builds 24-hour buckets for a single day, stopping at the current hour", () => {
    const today = parseRange({ range: "today" }, NOW);
    const s = buildSeries(rows, today.filter, "hour", NOW);
    expect(s).toHaveLength(17); // 00:00 to 16:00 Nigeria time
    expect(s.find((p) => p.label === "10:00")?.clicks).toBe(1);
  });
  it("breakdown shares add up", () => {
    const b = breakdown(rows, (r) => r.os);
    expect(b.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1);
  });
});

describe("pagination", () => {
  it("reads in pages of 1000 until the rows run out", async () => {
    const rows = Array.from({ length: 2500 }, () => eventRow());
    const { client, calls } = fakeClient(rows);
    const filter = parseRange({}, NOW).filter;
    const res = await fetchAll(client, "download_events", "created_at", filter);
    expect(res.rows).toHaveLength(2500);
    expect(calls.ranges).toEqual([[0, PAGE_SIZE - 1], [1000, 1999], [2000, 2999]]);
    expect(calls.eq).toContainEqual(["is_bot", false]); // bots filtered in the database too
  });
  it("stops at the cap and says so", async () => {
    const { client } = fakeClient(Array.from({ length: 3000 }, () => eventRow()));
    const res = await fetchAll(client, "download_events", "created_at", parseRange({}, NOW).filter, 1500);
    expect(res.rows).toHaveLength(1500);
    expect(res.truncated).toBe(true);
  });
});
