import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// POST only, so a stray link or image cannot sign someone out.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[admin] sign out failed", err);
  }
  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}
