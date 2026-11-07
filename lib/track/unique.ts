// Counting helper: how many different people (visitor ids) are in a list of events?
// The same person clicking five times counts once. Rows without a visitor id are not counted
// (we cannot tell who they are). Bots are skipped unless you ask for them.
export interface CountableEvent {
  visitor_id: string | null;
  is_bot: boolean;
}

export function countUniqueVisitors(events: CountableEvent[], includeBots = false): number {
  const seen = new Set<string>();
  for (const e of events) {
    if (!includeBots && e.is_bot) continue;
    if (e.visitor_id) seen.add(e.visitor_id);
  }
  return seen.size;
}
