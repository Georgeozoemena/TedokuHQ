import type { ButtonLocation } from "./constants";

/** One row of public.download_events (see supabase/migrations). */
export interface DownloadEvent {
  id: string;
  created_at: string;           // ISO timestamp
  visitor_id: string | null;
  ip_hash: string | null;       // salted SHA-256(ip + yyyy-mm-dd); never a raw IP
  country: string | null;       // ISO-3166 alpha-2
  region: string | null;
  device_type: "mobile" | "tablet" | "desktop";
  os: "Android" | "iOS" | "Windows" | "macOS" | "Linux" | "other";
  browser: string;
  referrer_host: string | null; // host only
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  button_location: ButtonLocation;
  is_bot: boolean;
  app_version: string;
}

/** One row of public.app_first_opens. */
export interface FirstOpen {
  id: string;
  created_at: string;
  install_id: string;
  app_version: string;
  os: string;
}

/** Filter used by every admin query and by the CSV export. */
export interface AdminFilter {
  from: string;          // ISO start (inclusive)
  to: string;            // ISO end (exclusive)
  includeBots: boolean;
}
