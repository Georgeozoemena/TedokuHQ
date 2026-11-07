import { NextResponse, type NextRequest } from "next/server";
import { ensureVisitorCookie } from "@/lib/visitor";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Admin area: refresh the Supabase session cookies (the real access check is done on the server in each page and route).
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return updateSession(req);
  }
  const res = NextResponse.next();
  // Landing pages only: give first-time visitors the anonymous visitor cookie.
  if (!pathname.startsWith("/api") && pathname !== "/download") ensureVisitorCookie(req, res);
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)"] };
