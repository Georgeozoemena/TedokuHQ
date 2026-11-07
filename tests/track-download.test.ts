import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEvent, handleDownload, logDownload, redirectTarget, type NewDownloadEvent } from "@/lib/track/log";
import { createRateLimiter } from "@/lib/track/ratelimit";

const APK = "https://files.example.com/tedoku.apk";
const UA = "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";

function req(path = "/download?from=hero", headers: Record<string, string> = {}) {
  return new Request(`https://tedoku.test${path}`, {
    headers: { "user-agent": UA, "x-forwarded-for": "102.89.34.7", cookie: "tdk_vid=11111111-2222-3333-4444-555555555555", ...headers },
  });
}
const base = { apkUrl: APK, salt: "s3cret", siteHost: "tedoku.test" };

afterEach(() => vi.restoreAllMocks());

describe("/download always redirects", () => {
  it("302 to APK_URL and logs one event", async () => {
    const rows: NewDownloadEvent[] = [];
    const res = await handleDownload(req(), { ...base, insert: async (r) => { rows.push(r); } });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(APK);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ button_location: "hero", os: "Android", device_type: "mobile", is_bot: false });
  });

  it("still redirects when the database insert fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleDownload(req(), { ...base, insert: async () => { throw new Error("database is down"); } });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(APK);
  });

  it("still redirects when the database never answers (timeout)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleDownload(req(), { ...base, timeoutMs: 20, insert: () => new Promise(() => {}) });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(APK);
  });

  it("still redirects with the default saver when Supabase env is missing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const res = await handleDownload(req(), base);
    vi.unstubAllEnvs();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(APK);
  });

  it("redirects to / when APK_URL is empty or not http(s)", async () => {
    for (const apkUrl of ["", "   ", "javascript:alert(1)", "not a url"]) {
      const res = await handleDownload(req(), { ...base, apkUrl, insert: async () => {} });
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/");
    }
  });

  it("never takes the target from the query string (no open redirect)", async () => {
    const res = await handleDownload(req("/download?from=hero&url=https://evil.example&next=https://evil.example&redirect=//evil.example"), {
      ...base, insert: async () => {},
    });
    expect(res.headers.get("location")).toBe(APK);
  });

  it("unknown ?from becomes 'other' and the redirect still happens", async () => {
    const rows: NewDownloadEvent[] = [];
    const res = await handleDownload(req("/download?from=<script>"), { ...base, insert: async (r) => { rows.push(r); } });
    expect(res.status).toBe(302);
    expect(rows[0].button_location).toBe("other");
  });

  it("does not log prefetch requests", async () => {
    const insert = vi.fn(async () => {});
    const res = await handleDownload(req("/download", { "sec-purpose": "prefetch" }), { ...base, insert });
    expect(res.status).toBe(302);
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("rate limit on /download", () => {
  it("logs the first 30 then keeps redirecting without logging", async () => {
    const insert = vi.fn(async () => {});
    const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
    let last: Response | undefined;
    for (let i = 0; i < 35; i++) last = await handleDownload(req(), { ...base, insert, limiter });
    expect(insert).toHaveBeenCalledTimes(30);
    expect(last?.status).toBe(302);
    expect(last?.headers.get("location")).toBe(APK);
  });
});

describe("bot flag on saved events", () => {
  it("flags Googlebot and a cookie-less, referrer-less script", () => {
    expect(buildEvent(req("/download", { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" }), base).is_bot).toBe(true);
    const bare = new Request("https://tedoku.test/download", { headers: { "user-agent": "curl/8.4.0" } });
    expect(buildEvent(bare, base).is_bot).toBe(true);
  });
  it("does not flag a normal visitor", () => {
    expect(buildEvent(req(), base).is_bot).toBe(false);
  });
});

describe("helpers", () => {
  it("redirectTarget accepts only http(s)", () => {
    expect(redirectTarget(APK)).toBe(APK);
    expect(redirectTarget("ftp://x.example/a")).toBe("/");
  });
  it("logDownload returns false instead of throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(logDownload({} as NewDownloadEvent, async () => { throw new Error("x"); })).resolves.toBe(false);
    await expect(logDownload({} as NewDownloadEvent, async () => {})).resolves.toBe(true);
  });
});
