// Server-side admin check used by every /admin page and every /api/admin route.
// It reads the signed-in user from Supabase (getUser asks Supabase to verify the session, it does not trust the cookie alone).
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { evaluateAdminAccess, type GateAal, type GateStatus } from "@/lib/admin/auth";

export interface Gate {
  status: GateStatus;
  email: string | null;
}

export async function getAdminGate(opts: { requireAal2?: boolean } = {}): Promise<Gate> {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    let aal: GateAal | null = null;
    if (user && opts.requireAal2 !== false) {
      const res = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      aal = res.data ?? null;
    }
    const status = evaluateAdminAccess({ user, aal, requireAal2: opts.requireAal2 });
    if (status === "expired") await supabase.auth.signOut(); // 8 hours are up: end the session for real
    return { status, email: status === "ok" ? (user?.email ?? null) : null };
  } catch (err) {
    console.error("[admin] access check failed", err);
    return { status: "unauthenticated", email: null }; // fail closed
  }
}

/** For API routes: returns an error response to send back, or null when the caller is a fully signed-in admin. */
export async function adminApiGuard(): Promise<NextResponse | null> {
  const { status } = await getAdminGate();
  const headers = { "Cache-Control": "no-store" };
  switch (status) {
    case "ok":
      return null;
    case "forbidden":
      return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
    case "mfa_required":
      return NextResponse.json({ error: "mfa_required" }, { status: 403, headers });
    default:
      return NextResponse.json({ error: "unauthenticated" }, { status: 401, headers });
  }
}
