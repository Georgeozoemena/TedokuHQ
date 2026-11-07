import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/track/ratelimit";

describe("rate limiter (30 per minute)", () => {
  it("allows 30 then blocks the 31st", () => {
    let t = 1_000_000;
    const rl = createRateLimiter({ limit: 30, windowMs: 60_000, now: () => t });
    for (let i = 0; i < 30; i++) expect(rl.check("a")).toBe(true);
    expect(rl.check("a")).toBe(false);
  });
  it("counts each key separately", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(rl.check("a")).toBe(true);
    expect(rl.check("b")).toBe(true);
    expect(rl.check("a")).toBe(false);
  });
  it("frees up as the window slides", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => t });
    expect(rl.check("a")).toBe(true);   // t=0
    t = 30_000;
    expect(rl.check("a")).toBe(true);   // t=30s
    expect(rl.check("a")).toBe(false);
    t = 60_001;                         // first hit has left the window, second has not
    expect(rl.check("a")).toBe(true);
    expect(rl.check("a")).toBe(false);
    t = 120_000;
    expect(rl.check("a")).toBe(true);
  });
  it("sweeps old keys when the map is full", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t, maxKeys: 2 });
    rl.check("a"); rl.check("b");
    t = 5000;
    expect(rl.check("c")).toBe(true);
  });
});
