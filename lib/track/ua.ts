// Turns a raw user agent string into three small, harmless fields.
// We store ONLY these parsed fields. The raw user agent is never saved.
import type { DownloadEvent } from "@/lib/types";

export interface ParsedUa {
  device_type: DownloadEvent["device_type"];
  os: DownloadEvent["os"];
  browser: string;
}

function detectOs(ua: string): ParsedUa["os"] {
  if (/android/i.test(ua)) return "Android";          // check before Linux: Android UAs also say Linux
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os x/i.test(ua)) return "macOS";
  if (/linux|x11|cros/i.test(ua)) return "Linux";
  return "other";
}

function detectDevice(ua: string, os: ParsedUa["os"]): ParsedUa["device_type"] {
  if (/ipad|tablet|kindle|silk/i.test(ua)) return "tablet";
  // Android phones say "Mobile"; Android tablets do not.
  if (os === "Android") return /mobile/i.test(ua) ? "mobile" : "tablet";
  if (/iphone|ipod|mobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/FBAN|FBAV/.test(ua)) return "Facebook app";
  if (/Instagram/i.test(ua)) return "Instagram app";
  if (/; wv\)/.test(ua)) return "Android WebView";
  if (/Edg(e|A|iOS)?\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\/|FxiOS/.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS|Chromium/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "other";
}

export function parseUserAgent(userAgent: string | null | undefined): ParsedUa {
  const ua = (userAgent ?? "").slice(0, 512); // never look at more than we need
  const os = detectOs(ua);
  return { device_type: detectDevice(ua, os), os, browser: detectBrowser(ua) };
}
