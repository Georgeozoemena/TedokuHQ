// Runs on every /admin and /api/admin request (see /middleware.ts).
// Its only jobs: keep the Supabase sign-in cookies fresh, and tell search engines and caches to stay away.
// It does NOT decide who may enter. That check happens on the server inside each page and API route
// (lib/admin/guard.ts), so removing this file can never open the dashboard.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function updateSession(req: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request: req });

  if (env.supabaseUrl && env.supabaseAnonKey) {
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          // Pass the refreshed cookies on to the page code and back to the browser.
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    try {
      // getUser() asks Supabase to validate the session and refresh it when it is close to expiring.
      await supabase.auth.getUser();
    } catch (err) {
      console.error("[admin] session refresh failed", err);
    }
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
