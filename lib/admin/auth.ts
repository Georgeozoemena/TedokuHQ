// The admin access rules as a PURE function (no network, no cookies), so it is easy to test.
// lib/admin/guard.ts feeds it the real signed-in user; tests feed it fake ones.
import { isAdminEmail } from "@/lib/env";
import { ADMIN_SESSION_HOURS } from "@/lib/constants";

export type GateStatus = "ok" | "unauthenticated" | "forbidden" | "expired" | "mfa_required";

export interface GateUser {
  email?: string | null;
  last_sign_in_at?: string | null;
}
export interface GateAal {
  currentLevel?: string | null;
  nextLevel?: string | null;
}
export interface GateInput {
  user: GateUser | null;
  aal: GateAal | null;
  now?: Date;
  maxHours?: number;
  /** Set false only for the two-step setup page itself. */
  requireAal2?: boolean;
}

export function isSessionExpired(lastSignInAt: string | null | undefined, now: Date, maxHours: number): boolean {
  if (!lastSignInAt) return true; // cannot prove the session is fresh, so treat it as expired
  const t = new Date(lastSignInAt).getTime();
  if (Number.isNaN(t)) return true;
  return now.getTime() - t > maxHours * 60 * 60 * 1000;
}

/**
 * Order matters: first "who are you", then "are you on the list", then "is your session fresh",
 * then "did you finish two-step sign-in". Non-admins always get "forbidden" and learn nothing else.
 */
export function evaluateAdminAccess(input: GateInput): GateStatus {
  const { user, aal, now = new Date(), maxHours = ADMIN_SESSION_HOURS, requireAal2 = true } = input;
  if (!user) return "unauthenticated";
  if (!isAdminEmail(user.email)) return "forbidden";
  if (isSessionExpired(user.last_sign_in_at, now, maxHours)) return "expired";
  if (requireAal2) {
    // nextLevel is "aal2" when the user has a verified two-step factor. Then they must have completed it (currentLevel "aal2").
    if (!aal) return "mfa_required"; // could not check, so fail closed
    if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") return "mfa_required";
  }
  return "ok";
}
