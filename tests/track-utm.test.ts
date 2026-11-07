import { describe, expect, it } from "vitest";
import { countUniqueVisitors } from "@/lib/track/unique";
import {
  cleanCountry, cleanLabel, getClientIp, hostOnly, parseButtonLocation, parseUtmCookie, pickReferrerHost, readCookie,
} from "@/lib/track/utm";

describe("button location allowlist", () => {
  it("accepts known values", () => {
    for (const v of ["nav", "hero", "doctors", "closing", "install", "other"]) expect(parseButtonLocation(v)).toBe(v);
  });
  it("turns unknown or missing values into 'other'", () => {
    for (const v of ["footer", "HERO", "<script>", "", null, undefined]) expect(parseButtonLocation(v)).toBe("other");
  });
});

describe("utm cookie", () => {
  const enc = (o: unknown) => encodeURIComponent(JSON.stringify(o));
  it("reads source, medium and campaign", () => {
    expect(parseUtmCookie(enc({ s: "Instagram", m: "social", c: "launch_week" }))).toMatchObject({
      utm_source: "instagram", utm_medium: "social", utm_campaign: "launch_week",
    });
  });
  it("survives garbage", () => {
    for (const raw of [null, "", "%E0%A4%A", "not json", enc(null), enc("x"), enc([1])])
      expect(parseUtmCookie(raw)).toEqual({ utm_source: null, utm_medium: null, utm_campaign: null, landingReferrerHost: null });
  });
  it("strips odd characters and caps length", () => {
    expect(cleanLabel("<b>Hi</b>; drop table")).toBe("bhi/b drop table");
    expect(cleanLabel("x".repeat(500))?.length).toBe(100);
    expect(cleanLabel(42)).toBeNull();
  });
});

describe("referrer and request helpers", () => {
  it("keeps only the host", () => {
    expect(hostOnly("https://www.Instagram.com/p/abc?x=1")).toBe("instagram.com");
    expect(hostOnly("not a url at all ::")).toBeNull();
  });
  it("ignores our own site as a referrer and falls back to the landing referrer", () => {
    expect(pickReferrerHost("https://tedoku.test/", ["tedoku.test"], "t.co")).toBe("t.co");
    expect(pickReferrerHost("https://tedoku.test/", ["tedoku.test"], null)).toBeNull();
    expect(pickReferrerHost("https://l.instagram.com/?u=x", ["tedoku.test"], null)).toBe("l.instagram.com");
  });
  it("reads cookies, client ip and country safely", () => {
    expect(readCookie("a=1; tdk_vid=abc-123; b=2", "tdk_vid")).toBe("abc-123");
    expect(readCookie(null, "tdk_vid")).toBeNull();
    expect(getClientIp(new Headers({ "x-forwarded-for": " 1.2.3.4 , 5.6.7.8" }))).toBe("1.2.3.4");
    expect(getClientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(getClientIp(new Headers())).toBeNull();
    expect(cleanCountry("NG")).toBe("NG");
    expect(cleanCountry("ng")).toBeNull();
    expect(cleanCountry("NGA")).toBeNull();
  });
});

describe("unique visitor counting", () => {
  const rows = [
    { visitor_id: "a", is_bot: false },
    { visitor_id: "a", is_bot: false },   // same person clicking twice counts once
    { visitor_id: "b", is_bot: false },
    { visitor_id: "c", is_bot: true },
    { visitor_id: null, is_bot: false },  // unknown visitor: not counted
  ];
  it("counts distinct visitor ids, skipping bots by default", () => expect(countUniqueVisitors(rows)).toBe(2));
  it("can include bots", () => expect(countUniqueVisitors(rows, true)).toBe(3));
  it("handles an empty list", () => expect(countUniqueVisitors([])).toBe(0));
});
