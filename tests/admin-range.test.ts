import { describe, expect, it } from "vitest";
import { dayKey, isValidDateString, parseRange, rangeToQuery, startOfDay } from "@/lib/admin/range";

// 6 Nov 2026, 15:30 UTC = 16:30 in Nigeria
const NOW = new Date("2026-11-06T15:30:00.000Z");

describe("parseRange", () => {
  it("defaults to the last 7 days, bots off", () => {
    const r = parseRange({}, NOW);
    expect(r.key).toBe("7d");
    expect(r.filter.includeBots).toBe(false);
    expect(r.granularity).toBe("day");
    // 7 days including today: starts 6 days before midnight Nigeria time on 6 Nov
    expect(r.filter.from).toBe("2026-10-30T23:00:00.000Z");
    expect(r.filter.to).toBe("2026-11-06T23:00:00.000Z");
  });

  it("handles Today by the hour and starts at Nigerian midnight", () => {
    const r = parseRange({ range: "today" }, NOW);
    expect(r.granularity).toBe("hour");
    expect(r.filter.from).toBe("2026-11-05T23:00:00.000Z");
    expect(r.filter.to).toBe("2026-11-06T23:00:00.000Z");
  });

  it("handles 30 days and all time", () => {
    expect(parseRange({ range: "30d" }, NOW).filter.from).toBe("2026-10-07T23:00:00.000Z");
    expect(parseRange({ range: "all" }, NOW).filter.from).toBe("1970-01-01T00:00:00.000Z");
  });

  it("reads the bots switch only when it is exactly 1", () => {
    expect(parseRange({ bots: "1" }, NOW).filter.includeBots).toBe(true);
    expect(parseRange({ bots: "true" }, NOW).filter.includeBots).toBe(false);
  });

  it("accepts a valid custom range and makes the end inclusive of the last day", () => {
    const r = parseRange({ range: "custom", from: "2026-11-01", to: "2026-11-03" }, NOW);
    expect(r.key).toBe("custom");
    expect(r.filter.from).toBe("2026-10-31T23:00:00.000Z");
    expect(r.filter.to).toBe("2026-11-03T23:00:00.000Z");
    expect(r.customFrom).toBe("2026-11-01");
  });

  it("uses hours for a single custom day and clamps the end to today", () => {
    expect(parseRange({ range: "custom", from: "2026-11-02", to: "2026-11-02" }, NOW).granularity).toBe("hour");
    expect(parseRange({ range: "custom", from: "2026-11-01", to: "2027-01-01" }, NOW).customTo).toBe("2026-11-06");
  });

  it("falls back to 7 days with a notice for bad input", () => {
    for (const params of [
      { range: "custom", from: "2026-13-40", to: "2026-11-02" },
      { range: "custom", from: "2026-11-05", to: "2026-11-01" }, // backwards
      { range: "custom", from: "2000-01-01", to: "2026-11-01" }, // too long
      { range: "custom" },
      { range: "'; drop table download_events; --" },
    ]) {
      const r = parseRange(params, NOW);
      expect(r.key).toBe("7d");
      expect(r.notice).toBeTruthy();
    }
  });

  it("round-trips through rangeToQuery", () => {
    const r = parseRange({ range: "custom", from: "2026-11-01", to: "2026-11-03", bots: "1" }, NOW);
    expect(rangeToQuery(r)).toBe("range=custom&from=2026-11-01&to=2026-11-03&bots=1");
  });
});

describe("date helpers", () => {
  it("validates real calendar dates only", () => {
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2026-02-30")).toBe(false);
    expect(isValidDateString("26-02-28")).toBe(false);
  });
  it("uses Nigeria time for day boundaries", () => {
    expect(dayKey("2026-11-05T23:30:00.000Z")).toBe("2026-11-06");
    expect(startOfDay(new Date("2026-11-05T23:30:00.000Z")).toISOString()).toBe("2026-11-05T23:00:00.000Z");
  });
});
