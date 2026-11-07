// Small display helpers for the dashboard. All times are shown in Nigeria time (WAT).
import { TZ_OFFSET_MS } from "@/lib/admin/range";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

function parts(d: Date | string) {
  const t = typeof d === "string" ? new Date(d) : d;
  const s = new Date(t.getTime() + TZ_OFFSET_MS);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth(), d: s.getUTCDate(), h: s.getUTCHours(), min: s.getUTCMinutes(), dow: s.getUTCDay() };
}

export const formatNumber = (n: number) => n.toLocaleString("en-GB");
export const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(ratio > 0 && ratio < 0.1 ? 1 : 0)}%`;

/** "6 Nov" */
export function shortDay(d: Date | string): string {
  const p = parts(d);
  return `${p.d} ${MONTHS[p.m]}`;
}
/** "Fri 6 Nov" */
export function longDay(d: Date | string): string {
  const p = parts(d);
  return `${DAYS[p.dow]} ${p.d} ${MONTHS[p.m]}`;
}
/** "14:00" */
export function hourLabel(d: Date | string): string {
  return `${pad(parts(d).h)}:00`;
}
/** "6 Nov, 14:32" */
export function dateTime(d: Date | string): string {
  const p = parts(d);
  return `${p.d} ${MONTHS[p.m]}, ${pad(p.h)}:${pad(p.min)}`;
}

let regionNames: Intl.DisplayNames | null | undefined;
/** "NG" -> "Nigeria". Falls back to the code if the runtime has no region names. */
export function countryName(code: string | null): string {
  if (!code) return "Unknown";
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
