// Sends the magic-link email. We do this on the server so that:
//  - the allowlist (ADMIN_EMAILS) is checked BEFORE any email is sent, and never shown to the browser
//  - the answer is always the same, so the form cannot be used to discover who is an admin
import { NextResponse, type NextRequest } from "next/server";
import { env, isAdminEmail } from "@/lib/env";
import { createSupabaseServer } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Only accept requests that come from our own pages.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ error: "bad_origin" }, { status: 403 });

  let email = "";
  try {
    const body = (await req.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  if (isAdminEmail(email)) {
    try {
      const supabase = await createSupabaseServer();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        // The link comes back to our callback route, which swaps the one-time code for a session.
        options: { emailRedirectTo: `${env.siteUrl}/admin/auth/callback`, shouldCreateUser: true },
      });
      if (error) console.error("[admin] magic link failed", error.message);
    } catch (err) {
      console.error("[admin] magic link failed", err);
    }
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
