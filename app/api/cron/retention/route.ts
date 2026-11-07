// Nightly cleanup, called by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" automatically when the CRON_SECRET env variable is set.
// Deletes download_events and app_first_opens older than RETENTION_MONTHS (13).
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/server-admin";
import { isAuthorisedCron, retentionCutoff } from "@/lib/track/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorisedCron(request.headers.get("authorization"), env.cronSecret)) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const db = getServiceClient();
    const cutoff = retentionCutoff(new Date()).toISOString();
    const events = await db.from("download_events").delete({ count: "exact" }).lt("created_at", cutoff);
    if (events.error) throw new Error(events.error.message);
    const opens = await db.from("app_first_opens").delete({ count: "exact" }).lt("created_at", cutoff);
    if (opens.error) throw new Error(opens.error.message);
    return NextResponse.json({ ok: true, cutoff, deletedEvents: events.count ?? 0, deletedFirstOpens: opens.count ?? 0 });
  } catch (err) {
    console.error("[retention] failed:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
