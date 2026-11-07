import { describe, expect, it } from "vitest";
import { hashIp, utcDay } from "@/lib/track/hash";
import { buildEvent } from "@/lib/track/log";

describe("ip hash", () => {
  it("is a 64-character hex SHA-256 and never contains the raw IP", () => {
    const h = hashIp("102.89.34.7", "salt", "2025-03-01");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("102.89.34.7");
  });
  it("gives different hashes on different days", () => {
    expect(hashIp("102.89.34.7", "salt", "2025-03-01")).not.toBe(hashIp("102.89.34.7", "salt", "2025-03-02"));
  });
  it("gives the same hash on the same day, and differs with another salt or IP", () => {
    const base = hashIp("102.89.34.7", "salt", "2025-03-01");
    expect(hashIp("102.89.34.7", "salt", "2025-03-01")).toBe(base);
    expect(hashIp("102.89.34.7", "other", "2025-03-01")).not.toBe(base);
    expect(hashIp("102.89.34.8", "salt", "2025-03-01")).not.toBe(base);
  });
  it("utcDay formats yyyy-mm-dd", () => {
    expect(utcDay(new Date("2025-03-01T23:59:59Z"))).toBe("2025-03-01");
  });
});

describe("saved event contains no raw IP or raw user agent", () => {
  const ua = "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";
  const req = new Request("https://tedoku.test/download?from=hero", {
    headers: { "x-forwarded-for": "102.89.34.7, 10.0.0.1", "user-agent": ua, cookie: "tdk_vid=11111111-2222-3333-4444-555555555555" },
  });
  const day1 = buildEvent(req, { salt: "s3cret", now: () => new Date("2025-03-01T10:00:00Z") });
  const day2 = buildEvent(req, { salt: "s3cret", now: () => new Date("2025-03-02T10:00:00Z") });

  it("has a hash, different per day", () => {
    expect(day1.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(day1.ip_hash).not.toBe(day2.ip_hash);
  });
  it("does not contain the IP or the user agent anywhere", () => {
    const json = JSON.stringify(day1);
    expect(json).not.toContain("102.89.34.7");
    expect(json).not.toContain("Mozilla");
    expect(json).not.toContain("SM-A135F");
  });
  it("stores no hash at all when no salt is configured", () => {
    expect(buildEvent(req, { salt: "" }).ip_hash).toBeNull();
  });
});
