// Supabase client for client components (sign-in buttons, two-step code screen).
// It only ever uses the public anon key. Real access checks happen on the server.
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  // The NEXT_PUBLIC_ values are filled in at build time and are safe to expose.
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
}
