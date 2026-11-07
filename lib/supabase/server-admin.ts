// Server-only Supabase client that uses the SERVICE ROLE key. It bypasses Row Level Security,
// so it must only be used in route handlers and server components, never in client components.
// The key is read from the environment at call time, so it never ends up in the browser bundle.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = env.supabaseUrl;
  const key = env.supabaseServiceKey;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set (see .env.example).");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (see .env.example). Server only, never expose it.");
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}
