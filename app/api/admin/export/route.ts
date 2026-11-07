// CSV export of the current dashboard view. Same server-side admin check as the page.
// The file is built page by page and streamed, so a big export never sits fully in memory.
import { adminApiGuard } from "@/lib/admin/guard";
import { csvHeaderLine, eventToCsvLine } from "@/lib/admin/csv";
import { applyBotFilter, EVENT_COLUMNS, EXPORT_MAX_ROWS, iteratePages, type EventRow } from "@/lib/admin/queries";
import { dayKey, parseRange } from "@/lib/admin/range";
import { getServiceClient } from "@/lib/supabase/server-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // 401 when not signed in, 403 when signed in but not an admin. Nothing else runs before this passes.
  const denied = await adminApiGuard();
  if (denied) return denied;

  const parsed = parseRange(Object.fromEntries(new URL(req.url).searchParams));
  const client = getServiceClient();
  const encoder = new TextEncoder();
  const pages = iteratePages<EventRow>(client, "download_events", EVENT_COLUMNS, parsed.filter, EXPORT_MAX_ROWS);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode("﻿" + csvHeaderLine())); // BOM so Excel reads UTF-8 correctly
    },
    async pull(controller) {
      try {
        const next = await pages.next();
        if (next.done) return controller.close();
        const rows = applyBotFilter(next.value, parsed.filter.includeBots);
        controller.enqueue(encoder.encode(rows.map(eventToCsvLine).join("")));
      } catch (err) {
        console.error("[admin] export failed", err);
        controller.error(err);
      }
    },
    async cancel() {
      await pages.return(undefined);
    },
  });

  const name = `tedoku-clicks-${dayKey(parsed.filter.from).replace(/^1970.*/, "all")}-to-${dayKey(new Date(new Date(parsed.filter.to).getTime() - 1))}.csv`;
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
