import type { NextRequest, NextResponse } from "next/server";
import { VISITOR_COOKIE } from "./constants";

/** Sets the anonymous first-party visitor cookie on the first page visit. Used by middleware.ts. */
export function ensureVisitorCookie(req: NextRequest, res: NextResponse) {
  if (req.cookies.get(VISITOR_COOKIE)?.value) return;
  const id = crypto.randomUUID();
  res.cookies.set(VISITOR_COOKIE, id, {
    maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production", httpOnly: true, path: "/",
  });
}
