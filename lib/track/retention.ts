// Data retention: delete download events and first opens older than RETENTION_MONTHS (13).
import { RETENTION_MONTHS } from "@/lib/constants";
import { createHash, timingSafeEqual } from "node:crypto";

/** The moment before which rows are deleted: `months` calendar months before `now`. */
export function retentionCutoff(now: Date, months = RETENTION_MONTHS): Date {
  const d = new Date(now.getTime());
  d.setUTCMonth(d.getUTCMonth() - months);
  return d;
}

/** Checks "Authorization: Bearer <secret>" without leaking timing. An empty secret never matches. */
export function isAuthorisedCron(authHeader: string | null, secret: string): boolean {
  if (!secret || !authHeader?.startsWith("Bearer ")) return false;
  const a = createHash("sha256").update(authHeader.slice(7)).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
