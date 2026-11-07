// POST /api/first-open: the Android app calls this once, on its very first launch.
// We store only: install_id (a random uuid made by the app), app_version, os, created_at.
// No account, no phone, no IP, no device details.
import { env } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/server-admin";
import { hashIp, utcDay } from "./hash";
import { firstOpenLimiter, type RateLimiter } from "./ratelimit";
import { getClientIp } from "./utm";

export interface FirstOpenInput {
  install_id: string;
  app_version: string;
  os: string;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERSION = /^[0-9A-Za-z][0-9A-Za-z.+_-]{0,31}$/;
const ALLOWED_OS = ["android", "ios", "other"];

/** Returns the clean row to store, or null if the body is not valid. */
export function validateFirstOpen(body: unknown): FirstOpenInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const { installId, appVersion, os } = b;
  if (typeof installId !== "string" || !UUID_V4.test(installId)) return null;
  if (typeof appVersion !== "string" || !VERSION.test(appVersion)) return null;
  if (typeof os !== "string" || !ALLOWED_OS.includes(os.toLowerCase())) return null;
  return { install_id: installId.toLowerCase(), app_version: appVersion, os: os.toLowerCase() };
}

export type InsertFirstOpen = (row: FirstOpenInput) => Promise<void>;

/** Default saver. A repeat call with the same install_id is ignored, not an error. */
export const insertFirstOpen: InsertFirstOpen = async (row) => {
  const { error } = await getServiceClient()
    .from("app_first_opens")
    .upsert(row, { onConflict: "install_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
};

export interface FirstOpenDeps {
  insert?: InsertFirstOpen;
  limiter?: RateLimiter;
  salt?: string;
}

const MAX_BODY_BYTES = 1024;

export async function handleFirstOpen(req: Request, deps: FirstOpenDeps = {}): Promise<Response> {
  // Rate limit by hashed IP (the hash is only used in memory here, never stored).
  const ip = getClientIp(req.headers);
  if (ip) {
    const key = hashIp(ip, deps.salt ?? env.ipHashSalt, utcDay(new Date()));
    if (!(deps.limiter ?? firstOpenLimiter).check(key)) return new Response(null, { status: 429 });
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const row = validateFirstOpen(json);
  if (!row) return new Response(null, { status: 400 });

  try {
    await (deps.insert ?? insertFirstOpen)(row);
  } catch (err) {
    console.error("[first-open] could not save:", err instanceof Error ? err.message : "unknown error");
    return new Response(null, { status: 500 }); // the app may try again later
  }
  return new Response(null, { status: 204 });
}
