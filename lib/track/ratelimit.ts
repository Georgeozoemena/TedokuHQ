// Simple in-memory sliding-window rate limiter.
//
// LIMITATION (important on serverless hosts such as Vercel): memory is per server instance.
// Each warm instance keeps its own counters and they reset on a cold start, so the real limit
// is "about 30 per minute per instance", not a hard global cap. That is good enough to stop a
// script from flooding the table by accident, but it is not abuse-proof.
//
// To make it a true global limit, swap `check` for a shared store. With Upstash Redis:
//   npm i @upstash/ratelimit @upstash/redis
//   const rl = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(30, "1 m") });
//   const { success } = await rl.limit(ipHash);   // success === false means "over the limit"
// Then make `allowed` in lib/track/log.ts await that instead of calling this limiter.
import { RATE_LIMIT_PER_MINUTE } from "@/lib/constants";

export interface RateLimiter {
  /** Returns true if this request is allowed (and records it), false if over the limit. */
  check(key: string): boolean;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;   // injectable clock for tests
  maxKeys?: number;     // safety cap so memory cannot grow forever
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const { limit, windowMs, now = Date.now, maxKeys = 10_000 } = opts;
  const hits = new Map<string, number[]>();

  function sweep(t: number) {
    for (const [key, times] of hits) {
      if (times.length === 0 || times[times.length - 1] <= t - windowMs) hits.delete(key);
    }
  }

  return {
    check(key: string): boolean {
      const t = now();
      if (hits.size >= maxKeys) sweep(t);
      const recent = (hits.get(key) ?? []).filter((x) => x > t - windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false; // over the limit: not recorded, so the window frees up as old hits expire
      }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}

/** Shared limiter for /download: 30 requests per minute per ip_hash. */
export const downloadLimiter = createRateLimiter({ limit: RATE_LIMIT_PER_MINUTE, windowMs: 60_000 });

/** Separate, tighter limiter for POST /api/first-open (the app calls it once per install). */
export const firstOpenLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
