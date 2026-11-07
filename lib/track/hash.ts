// Privacy: we never store a raw IP address. We store a one-way hash that changes every day,
// so the same person on two different days looks like two different people, and nobody can
// turn the hash back into an IP (the secret salt lives only in the IP_HASH_SALT env variable).
import { createHash } from "node:crypto";

/** Today's date in UTC as yyyy-mm-dd. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** SHA-256 of ip + day + salt (with separators so values cannot run into each other). */
export function hashIp(ip: string, salt: string, day: string): string {
  return createHash("sha256").update(`${ip}|${day}|${salt}`).digest("hex");
}
