// Supabase client for server code that acts as the SIGNED-IN USER (reads the session cookies).
// Use it to find out who is signed in. For reading analytics data use getServiceClient()
// from lib/supabase/server-admin.ts, and only after the admin check has passed.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createSupabaseServer() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example).");
  }
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components cannot write cookies. That is fine: middleware already refreshed them.
        }
      },
    },
  });
}
