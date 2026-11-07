import { describe, expect, it, vi } from "vitest";
import { handleFirstOpen, validateFirstOpen } from "@/lib/track/firstOpen";
import { createRateLimiter } from "@/lib/track/ratelimit";
import { isAuthorisedCron, retentionCutoff } from "@/lib/track/retention";

const GOOD = { installId: "3b241101-e2bb-4255-8caf-4136c566a962", appVersion: "1.0.0", os: "android" };
const post = (body: unknown) =>
  new Request("https://tedoku.test/api/first-open", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });

describe("first-open validation", () => {
  it("accepts a good body", () => {
    expect(validateFirstOpen(GOOD)).toEqual({ install_id: GOOD.installId, app_version: "1.0.0", os: "android" });
  });
  it.each([
    [{ ...GOOD, installId: "not-a-uuid" }],
    [{ ...GOOD, installId: "3b241101-e2bb-1255-8caf-4136c566a962" }], // not version 4
    [{ ...GOOD, appVersion: "" }],
    [{ ...GOOD, appVersion: "1.0.0; drop table" }],
    [{ ...GOOD, os: "windows" }],
    [{ ...GOOD, os: 5 }],
    [null], ["text"], [[]],
  ])("rejects %j", (body) => expect(validateFirstOpen(body)).toBeNull());
});

describe("POST /api/first-open", () => {
  it("returns 204 and saves only the three fields", async () => {
    const insert = vi.fn(async () => {});
    const res = await handleFirstOpen(post({ ...GOOD, email: "me@example.com" }), { insert });
    expect(res.status).toBe(204);
    expect(insert).toHaveBeenCalledWith({ install_id: GOOD.installId, app_version: "1.0.0", os: "android" });
  });
  it("400 for bad JSON or bad fields, nothing saved", async () => {
    const insert = vi.fn(async () => {});
    expect((await handleFirstOpen(post("{nope"), { insert })).status).toBe(400);
    expect((await handleFirstOpen(post({ ...GOOD, installId: "x" }), { insert })).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
  it("413 for an oversized body", async () => {
    expect((await handleFirstOpen(post("x".repeat(5000)), { insert: async () => {} })).status).toBe(413);
  });
  it("500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleFirstOpen(post(GOOD), { insert: async () => { throw new Error("down"); } });
    expect(res.status).toBe(500);
  });
  it("429 when one network sends too many", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    const mk = () => new Request("https://tedoku.test/api/first-open", { method: "POST", body: JSON.stringify(GOOD), headers: { "x-forwarded-for": "1.2.3.4" } });
    const deps = { insert: async () => {}, limiter, salt: "s" };
    expect((await handleFirstOpen(mk(), deps)).status).toBe(204);
    expect((await handleFirstOpen(mk(), deps)).status).toBe(429);
  });
});

describe("retention", () => {
  it("cutoff is 13 months before now", () => {
    expect(retentionCutoff(new Date("2025-06-15T03:17:00Z")).toISOString()).toBe("2024-05-15T03:17:00.000Z");
  });
  it("cron needs the exact Bearer secret; an empty secret never matches", () => {
    expect(isAuthorisedCron("Bearer abc", "abc")).toBe(true);
    expect(isAuthorisedCron("Bearer abd", "abc")).toBe(false);
    expect(isAuthorisedCron("abc", "abc")).toBe(false);
    expect(isAuthorisedCron(null, "abc")).toBe(false);
    expect(isAuthorisedCron("Bearer ", "")).toBe(false);
  });
});
