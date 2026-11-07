import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateAdminAccess, isSessionExpired } from "@/lib/admin/auth";
import { eventRow, fakeClient } from "./admin-fake-client";

// ---- mocks for the route-handler test: a fake signed-in user and a spy on the service client ----
let mockUser: { email: string; last_sign_in_at: string } | null = null;
let mockAal: { currentLevel: string; nextLevel: string } = { currentLevel: "aal1", nextLevel: "aal1" };
const signOut = vi.fn(async () => ({}));
const serviceClientSpy = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: async () => ({
    auth: {
      getUser: async () => ({ data: { user: mockUser } }),
      signOut,
      mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: mockAal }) },
    },
  }),
}));
vi.mock("@/lib/supabase/server-admin", () => ({
  getServiceClient: () => {
    serviceClientSpy();
    return fakeClient([eventRow({ utm_source: "=evil()" })]).client;
  },
}));

const NOW = new Date("2026-11-06T12:00:00.000Z");
const fresh = "2026-11-06T10:00:00.000Z";
const stale = "2026-11-05T20:00:00.000Z"; // 16 hours ago

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAILS", "Boss@Tedoku.test, second@tedoku.test");
  mockUser = null;
  mockAal = { currentLevel: "aal1", nextLevel: "aal1" };
  signOut.mockClear();
  serviceClientSpy.mockClear();
});
afterEach(() => vi.unstubAllEnvs());

describe("evaluateAdminAccess (pure guard)", () => {
  const ok = { currentLevel: "aal1", nextLevel: "aal1" };
  it("rejects nobody-signed-in, non-admins, old sessions", () => {
    expect(evaluateAdminAccess({ user: null, aal: ok, now: NOW })).toBe("unauthenticated");
    expect(evaluateAdminAccess({ user: { email: "x@y.test", last_sign_in_at: fresh }, aal: ok, now: NOW })).toBe("forbidden");
    expect(evaluateAdminAccess({ user: { email: "boss@tedoku.test", last_sign_in_at: stale }, aal: ok, now: NOW })).toBe("expired");
  });
  it("matches the allowlist ignoring case and spaces", () => {
    expect(evaluateAdminAccess({ user: { email: "BOSS@tedoku.test", last_sign_in_at: fresh }, aal: ok, now: NOW })).toBe("ok");
    expect(evaluateAdminAccess({ user: { email: "second@tedoku.test", last_sign_in_at: fresh }, aal: ok, now: NOW })).toBe("ok");
  });
  it("does not accept an empty allowlist or empty email", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(evaluateAdminAccess({ user: { email: "boss@tedoku.test", last_sign_in_at: fresh }, aal: ok, now: NOW })).toBe("forbidden");
    expect(evaluateAdminAccess({ user: { email: null, last_sign_in_at: fresh }, aal: ok, now: NOW })).toBe("forbidden");
  });
  it("expires after exactly more than 8 hours and fails closed without a timestamp", () => {
    expect(isSessionExpired("2026-11-06T04:00:00.000Z", NOW, 8)).toBe(false);
    expect(isSessionExpired("2026-11-06T03:59:00.000Z", NOW, 8)).toBe(true);
    expect(isSessionExpired(null, NOW, 8)).toBe(true);
  });
  it("demands the second step only when the user has a verified factor", () => {
    const user = { email: "boss@tedoku.test", last_sign_in_at: fresh };
    expect(evaluateAdminAccess({ user, aal: { currentLevel: "aal1", nextLevel: "aal2" }, now: NOW })).toBe("mfa_required");
    expect(evaluateAdminAccess({ user, aal: { currentLevel: "aal2", nextLevel: "aal2" }, now: NOW })).toBe("ok");
    expect(evaluateAdminAccess({ user, aal: null, now: NOW })).toBe("mfa_required");
    expect(evaluateAdminAccess({ user, aal: { currentLevel: "aal1", nextLevel: "aal2" }, now: NOW, requireAal2: false })).toBe("ok");
  });
});

describe("GET /api/admin/export", () => {
  const call = async () => {
    const { GET } = await import("@/app/api/admin/export/route");
    return GET(new Request("http://localhost/api/admin/export?range=7d"));
  };

  it("returns 401 with no data when nobody is signed in", async () => {
    const res = await call();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthenticated" });
    expect(serviceClientSpy).not.toHaveBeenCalled(); // the database was never touched
  });

  it("returns 403 with no data for a signed-in non-admin", async () => {
    mockUser = { email: "stranger@example.test", last_sign_in_at: new Date().toISOString() };
    const res = await call();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
    expect(serviceClientSpy).not.toHaveBeenCalled();
  });

  it("returns 401 and signs out when the 8-hour session has ended", async () => {
    mockUser = { email: "boss@tedoku.test", last_sign_in_at: new Date(Date.now() - 9 * 3600_000).toISOString() };
    const res = await call();
    expect(res.status).toBe(401);
    expect(signOut).toHaveBeenCalled();
    expect(serviceClientSpy).not.toHaveBeenCalled();
  });

  it("returns 403 for an admin who has not finished two-step sign-in", async () => {
    mockUser = { email: "boss@tedoku.test", last_sign_in_at: new Date().toISOString() };
    mockAal = { currentLevel: "aal1", nextLevel: "aal2" };
    const res = await call();
    expect(res.status).toBe(403);
    expect(serviceClientSpy).not.toHaveBeenCalled();
  });

  it("serves a safe CSV to a signed-in admin", async () => {
    mockUser = { email: "boss@tedoku.test", last_sign_in_at: new Date().toISOString() };
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("created_at,country");
    expect(text).toContain("'=evil()"); // formula neutralised
    expect(text).not.toContain("v1"); // visitor id is never exported
  });
});
