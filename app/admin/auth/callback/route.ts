// Sign-in comes back here (from the magic-link email or from Google) with a one-time ?code=.
// We swap it for a session cookie, then always go to /admin. The destination is fixed, so this cannot be used as an open redirect.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code && code.length < 512) {
    try {
      const supabase = await createSupabaseServer();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/admin", req.url));
    } catch (err) {
      console.error("[admin] code exchange failed", err);
    }
  }
  return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
}
